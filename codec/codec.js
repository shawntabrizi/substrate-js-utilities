let rawBytes = document.getElementById('rawBytes');
let customTypes = document.getElementById('customTypes');
let output = document.getElementById('output');

customTypes.addEventListener('input', parseCustomType);
rawBytes.addEventListener('input', parseCustomType);

/* CUSTOM TYPES EDITOR START */

// create the editor
const options = { mode: 'code', onChange: parseCustomType };
const editor = new JSONEditor(customTypes, options);

// set json
const initialJson = [{ MyVec: 'Vec<u16>' }];
editor.set(initialJson);

/* CUSTOM TYPES EDITOR END */

const registry = new types.TypeRegistry();

function parseCustomType() {
  try {
    let typesObject = editor.get();

    let lastTypeKey;

    if (Array.isArray(typesObject)) {
      typesObject.map(type => {
        registry.register(type);
      });

      let lastTypeObject = typesObject[typesObject.length - 1];
      lastTypeKey = Object.keys(lastTypeObject)[0];
    } else {
      registry.register(typesObject);
      lastTypeKey = Object.keys(typesObject)[0];
    }

    output.innerText = JSON.stringify(
      types.createType(registry, lastTypeKey, rawBytes.value.trim())
    );
  } catch (e) {
    output.innerText = e;
  }
}

parseCustomType();
