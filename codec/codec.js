let rawBytes = document.getElementById("rawBytes");
let customTypes = document.getElementById("customTypes");

customTypes.addEventListener("input", parseCustomType);

function parseCustomType() {
	console.log(customTypes.value);
}
