export const deleteCookie = (name) => {
  document.cookie = name + `=; expires= ${new Date(0)}`;
}

const errorMessagesMap = {
  400: 'Bad request',
  401: 'Not authorizated',
  404: 'Not found',
  405: 'Method not allowed',
  409: 'Conflict',
  500: 'Server error',
};

export const responseError = (response, errorCode = 500, data = errorMessagesMap[errorCode]) => {
  response.writeHead(errorCode, { "Content-Type": "text/plain" });
  response.end(data);
};

export const handleErrors = (errors, userData) => {
  const errorsMap = errors.reduce((acc, { field, message }) => {
    acc[field] = message;
    return acc;
  }, {});

  Object.keys(userData).forEach(field => {
    const error = errorsMap[field];

    form[field].closest('.form__field-container')
      .querySelector('.form__message').innerHTML = error || '';
    form[field].style.border = error ? '1px red solid' : 'none';
  });
};


export const send = async (url, options) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options,
  });
  const data = await res.json();

  if (res.ok) {
    return data;
  }

  return Promise.reject(data);
}


