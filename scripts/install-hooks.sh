#!/bin/sh
set -eu

is_ci() {
	case "${CI:-}" in true | 1) return 0 ;; *) return 1 ;; esac
}

has_custom_hooks_path() {
	configured_path=$(git config --get core.hooksPath || true)
	[ -n "$configured_path" ]
}

hook_exists() {
	[ -e "$hook_path" ] || [ -L "$hook_path" ]
}

write_hook() {
	hook_name=${1:?Missing hook name}
	hook_path="$hooks_dir/$hook_name"
	if hook_exists; then
		printf 'Keeping existing hook: %s\n' "$hook_name"
		return
	fi
	candidate="$hook_stage_dir/$hook_name"
	cat >"$candidate"
	chmod 755 "$candidate"
	ln "$candidate" "$hook_path"
}

install_pre_commit() {
	write_hook pre-commit <<'HOOK'
#!/bin/sh
set -eu
main() {
  exec chomp pre-commit
}
main "$@"
HOOK
}

install_post_merge() {
	write_hook post-merge <<'HOOK'
#!/bin/sh
set -eu
main() {
  exec chomp post-merge
}
main "$@"
HOOK
}

install_commit_message() {
	write_hook commit-msg <<'HOOK'
#!/bin/sh
set -eu
main() {
  PATH="$PWD/.bin:$PATH"
  export PATH
  exec node scripts/check-commit-message.js "$1"
}
main "$@"
HOOK
}

main() {
	if is_ci; then return; fi
	hooks_dir=$(git rev-parse --git-path hooks)
	if has_custom_hooks_path; then
		printf 'core.hooksPath is already configured; leaving it unchanged.\n' >&2
		exit 1
	fi
	mkdir -p "$hooks_dir"
	hook_stage_dir=$(mktemp -d "$hooks_dir/node-importmap-loader.XXXXXX")
	trap 'rm -rf "$hook_stage_dir"' EXIT
	install_pre_commit
	install_post_merge
	install_commit_message
}

main "$@"
