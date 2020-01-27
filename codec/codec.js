let rawBytes = document.getElementById('rawBytes');
let customTypes = document.getElementById('customTypes');
let output = document.getElementById('output');

customTypes.addEventListener('input', parseCustomType);
rawBytes.addEventListener('input', parseCustomType);

/* CUSTOM TYPES EDITOR START */

// create the editor
const options = { mode: 'code' };
const editor = new JSONEditor(customTypes, options);

// set json
const initialJson = [
  { MyEnum: { _enum: ['A', 'B', 'C'] } },
  { MyPartA: 'Vec<(MyEnum, u32)>' },
  { MyType: '(MyPartA, u128)' },
  { MyFinalType: 'Vec<MyType>' }
];
editor.set(initialJson);
/* CUSTOM TYPES EDITOR END */

const registry = new types.TypeRegistry();

function parseCustomType() {
  try {
    console.log(editor.get());

    let typesArray = editor.get();

    typesArray.map(type => {
      registry.register(type);
    });

    let lastTypeObject = typesArray[typesArray.length - 1];
    let lastTypeKey = Object.keys(lastTypeObject)[0];
    console.log(lastTypeKey);
    output.innerText = JSON.stringify(
      types.createType(registry, lastTypeKey, rawBytes.value)
    );
  } catch (e) {
    console.error(e);
    output.innerText = e;
  }
}

parseCustomType();
