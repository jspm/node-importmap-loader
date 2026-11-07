#!/bin/sh
set -eu

has_pinned_node() {
	[ -x .bin/node ] || return 1
	current_version=$(.bin/node --version)
	[ "$current_version" = "v$NODE_VERSION" ] && [ -x .bin/npm ]
}

detect_system() {
	system=$(uname -s)
	case "$system" in
	Darwin) system=darwin ;;
	Linux) system=linux ;;
	*)
		printf 'Unsupported development platform: %s\n' "$system" >&2
		exit 1
		;;
	esac
}

detect_machine() {
	machine=$(uname -m)
	case "$machine" in
	arm64 | aarch64) machine=arm64 ;;
	x86_64 | amd64) machine=x64 ;;
	*)
		printf 'Unsupported development architecture: %s\n' "$machine" >&2
		exit 1
		;;
	esac
}

needs_download() {
	[ ! -d "$runtime_dir" ]
}

verify_archive() {
	awk -v file="$archive" '$2 == file { print }' "$work_dir/SHASUMS256.txt" >"$work_dir/checksum.txt"
	[ -s "$work_dir/checksum.txt" ]
	if command -v sha256sum >/dev/null 2>&1; then
		(cd "$work_dir" && sha256sum -c checksum.txt)
	else
		(cd "$work_dir" && shasum -a 256 -c checksum.txt)
	fi
}

download_node() {
	mkdir -p .cache/dev-node
	work_dir=$(mktemp -d .cache/dev-node/download.XXXXXX)
	trap 'rm -rf "$work_dir"' EXIT
	archive="$distribution.tar.gz"
	release_url="https://nodejs.org/dist/v$NODE_VERSION"
	curl --fail --location --silent --show-error --retry 3 "$release_url/$archive" -o "$work_dir/$archive"
	curl --fail --location --silent --show-error --retry 3 "$release_url/SHASUMS256.txt" -o "$work_dir/SHASUMS256.txt"
	verify_archive
	tar -xzf "$work_dir/$archive" -C "$work_dir"
	mv "$work_dir/$distribution" "$runtime_dir"
}

link_node() {
	mkdir -p .bin
	for tool in node npm npx; do
		ln -sfn "../$runtime_dir/bin/$tool" ".bin/$tool"
	done
}

main() {
	: "${NODE_VERSION:?Run this script through Chomp.}"
	printf '%s\n' "$NODE_VERSION" | grep -Eq '^26\.[0-9]+\.[0-9]+$'
	if has_pinned_node; then return; fi
	detect_system
	detect_machine
	platform="$system-$machine"
	distribution="node-v$NODE_VERSION-$platform"
	runtime_dir=".cache/dev-node/$distribution"
	if needs_download; then download_node; fi
	link_node
	has_pinned_node
	.bin/node --version
}

main "$@"
