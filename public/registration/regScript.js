import { send, handleErrors } from "../modules/helpers.js";
import { fieldValidators } from "../modules/validators.mjs";

const form = document.forms.form;

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const { errors, userData } = check();

  handleErrors(errors, userData);

  if (!errors.length) {
    send('http://localhost:3000/api/users', { method: "POST", body: JSON.stringify(userData) })
      .then(() => window.location.replace("/"))
      .catch(err => handleErrors(err, userData));
  }
});

function check() {
  const errors = [];
  const userData = {};

  for (let field of form) {
    let { name, value = "" } = field;
    value = value.trim();

    if (name) userData[name] = value;

    const validators = fieldValidators[name] || [];

    if (!validators.length) continue;

    // const error = validators.map(validator => validator(value)).find(error => error);

    // if (error) {
    //   errors.push({
    //     message: error,
    //     field: name,
    //   });
    // }
  };

  return { userData, errors };
}

