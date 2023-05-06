import standalone from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
const { format } = standalone

const CODE = String(`
  function HelloWorld({greeting = "hello", greeted = '"World"', silent = false, onMouseOver,}) {

    if(!greeting){return null};

       // TODO: Don't use random in render
    let num = Math.floor (Math.random() * 1E+7).toString().replace(/\.\d+/ig, "")

    return <div className='HelloWorld' onMouseOver={onMouseOver}>

      <strong>{ greeting.slice( 0, 1 ).toUpperCase() + greeting.slice(1).toLowerCase() }</strong>
      {greeting.endsWith(",") ? " " : <span style={{color: '\grey'}}>", "</span> }
      <em>
	{ greeted }
	</em>
      { (silent)
        ? "."
        : "!"}

      </div>;

  }
`)

const result = format(CODE, { parser: 'babel', plugins: [parserBabel] })
console.log(result)
