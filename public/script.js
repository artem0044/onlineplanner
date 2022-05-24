import { send, deleteCookie } from "../modules/helpers.js";
import { fieldValidators } from "./modules/validators.mjs";

const colors = ['#0000ff80', '#ff45008a', '#ff00009e', '#808080a6', '#ffff0078', '#a52a2aa8', 'brown'];
const divs = Array.from(document.querySelectorAll('.color-list__color'));
const colorList = document.querySelector('.color-list');

for (let i = 0; i < colors.length; i++) {
  divs[i].style.backgroundColor = colors[i];
}

const enterTextInput = document.getElementById('text');
const area = document.getElementById('area');


const crossOut = document.getElementById("cross-out");
const toBoldText = document.getElementById("bold");
const underline = document.getElementById("underline");

const selectFontFamily = document.getElementById('fontFamily');
const selectFontSize = document.getElementById("fontSize");

const save = document.getElementById('save');
const logOut = document.getElementById('log-out');

enterTextInput.addEventListener('input', function () {
  area.value = enterTextInput.value;

});

area.addEventListener("input", () => {
  enterTextInput.value = area.value;
});

logOut.addEventListener("click", () => {
  deleteCookie('token');
  window.location.replace('/login');
});


// *****Note features********

function cross() {
  area.classList.toggle("main__text-decor");
}

crossOut.addEventListener("click", cross);

toBoldText.addEventListener("click", () => {
  area.classList.toggle("main__to-bold");
});

underline.addEventListener("click", () => {
  area.classList.toggle("main__text-underline");
});

colorList.addEventListener('click', function (event) {
  area.style.backgroundColor = event.target.style.backgroundColor;
});


selectFontFamily.addEventListener('input', () => {
  area.style.fontFamily = selectFontFamily.value;
});


selectFontSize.addEventListener("input", () => {
  area.style.fontSize = selectFontSize.value + 'px';
});

// *****Note features********


// ****Save****
let stickerList = [];
let stickerId;
let timestamp = '';
const dateInput = document.getElementById('date-input');
const noteContainers = document.querySelectorAll('[data-container-name]');
const defaultRadioButton = document.getElementById('default');


const clearArea = () => {
  enterTextInput.value = '';
  area.value = '';
  timestamp = '';
  dateInput.value = '';
  area.style.backgroundColor = '';
  area.style.fontFamily = '';
  area.style.fontSize = '';
  area.classList.remove('main__text-decor', 'main__to-bold', 'main__text-underline');

};

const renderStickers = (stickerList) => {

  noteContainers.forEach(noteContainer => {
    for (let container of Array.from(noteContainer.querySelectorAll('div'))) {
      container.remove();
    }
  });

  // stickerList.sort((a, b) => {
  //   return a.order - b.order;
  // });

  stickerList.map(data => {
    const container = document.querySelector(`[data-container-name="${data.status}"]`);
    const noteContainer = document.createElement('div');
    noteContainer.classList.add('list__note-container');


    const copyArea = document.createElement('textarea');
    copyArea.classList.add('main__textarea');
    copyArea.classList.add('main__textarea--copy');
    copyArea.readOnly = true;
    copyArea.style.cursor = 'default';

    if (data.style.toBold) {
      copyArea.classList.add('main__to-bold');
    }

    if (data.style.underline) {
      copyArea.classList.add('main__text-underline');
    }

    if (data.style.cross) {
      copyArea.classList.add('main__text-decor');
    }

    const topStripe = document.createElement('div');
    topStripe.classList.add('list__top-stripe');

    copyArea.value = data.content;
    copyArea.style.backgroundColor = data.style.bgColor;
    copyArea.style.fontFamily = data.style.fontFamily;
    copyArea.style.fontSize = data.style.fontSize;
    const edit = document.createElement('img');
    edit.src = './images/pen.svg'

    edit.setAttribute('data-action', 'edit');
    edit.setAttribute('data-stickerId', data.id);
    edit.setAttribute('data-open-popup', 'editor');

    const del = document.createElement('img');
    del.src = './images/delete.svg';
    del.setAttribute('data-action', 'del');
    del.setAttribute('data-stickerId', data.id);

    if (data.timestamp) {
      const different = data.timestamp - Date.now();

      setTimeout(() => {
        copyArea.style.border = '2px red solid';
      }, different);
    }

    topStripe.append(edit, del);
    container.append(noteContainer);
    noteContainer.append(topStripe, copyArea);
  });
};



send('http://localhost:3000/api/stickers').then((data) => {
  stickerList.push(...data);
  renderStickers(data);
});

save.addEventListener("click", () => {
  const data = {
    content: area.value,
    style: {
      bgColor: area.style.backgroundColor,
      fontFamily: area.style.fontFamily,
      fontSize: area.style.fontSize,
      toBold: area.classList.contains('main__to-bold'),
      underline: area.classList.contains('main__text-underline'),
      cross: area.classList.contains("main__text-decor"),
    },
    timestamp,
    status: document.querySelector('input[name="status"]:checked').value,
  };


  if (stickerId) {
    send('http://localhost:3000/api/stickers', { method: "PUT", body: JSON.stringify({ ...data, stickerId }), credentials: 'include' })
      .then((data) => {
        const sticekerToUpdate = stickerList.find(sticker => sticker.id == stickerId);

        // if (sticekerToUpdate.status != data.status) {
        //   const orderData = {
        //     stickerId,
        //     oldOrder: sticekerToUpdate.order,
        //     newOrder: null,
        //   };

        //   send('http://localhost:3000/api/stickers/reorder', { method: 'PUT', body: JSON.stringify(orderData), credentials: 'include' });
        // }

        sticekerToUpdate.content = data.content;
        sticekerToUpdate.style.bgColor = data.style.bgColor;
        sticekerToUpdate.style.fontFamily = data.style.fontFamily;
        sticekerToUpdate.style.fontSize = data.style.fontSize;
        sticekerToUpdate.timestamp = data.timestamp;
        sticekerToUpdate.status = data.status;

        const stickerIndex = stickerList.indexOf(sticekerToUpdate);
        const sticker = stickerList.splice(stickerIndex, 1)[0];
        stickerList.push(sticker);
        
        console.log(stickerList);
        renderStickers(stickerList);

        clearArea();
        stickerId = '';
      })
      .catch(err => console.log(err));

    return;
  }

  send('http://localhost:3000/api/stickers', { method: "POST", body: JSON.stringify(data), credentials: 'include' })
    .then(data => {
      clearArea();

      stickerList.push(data);

      renderStickers(stickerList);
    })
    .catch(err => console.log(err));

  return;
});
// ****Save****


//****************Remove AND Edit*****************


const clearStickerBtn = document.getElementById('clear');

clearStickerBtn.addEventListener('click', clearArea);

const deleteSticker = (stickerID) => {
  send(`http://localhost:3000/api/stickers/${stickerID}`, { method: "DELETE", credentials: 'include' })
    .then(() => {
      const deletedStickerIndex = stickerList.findIndex(sticker => sticker.id == stickerID);
      stickerList.splice(deletedStickerIndex, 1);
      renderStickers(stickerList);
    })
    .catch(err => console.log(err));
};

const updateSticker = (stickerID) => {
  document.getElementById('editor').style.display = 'block';

  const sticker = stickerList.find(sticker => sticker.id == stickerID);

  area.value = sticker.content;
  area.style.backgroundColor = sticker.style.bgColor;
  area.style.fontFamily = sticker.style.fontFamily;
  area.style.fontSize = sticker.style.fontSize;
  stickerId = stickerID;
  timestamp = sticker.timestamp;
};

noteContainers.forEach(noteContainer => {
  noteContainer.addEventListener("click", event => {
    if (!event.target.hasAttribute('data-action')) return;

    const action = event.target.getAttribute('data-action');
    const stickerID = event.target.getAttribute('data-stickerId');

    switch (action) {
      case 'del':
        deleteSticker(stickerID);
        break;
      case 'edit':
        updateSticker(stickerID);
        break;
    }
  });
});

//*****************Remove AND Edit*****************



/******************Deadline ***********/
const sendTimeBtn = document.getElementById('send-time');
const closePopupBtns = document.querySelectorAll('[data-close-popup]')
const openPopupBtns = document.querySelectorAll('[data-open-popup]');


closePopupBtns.forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.closePopup === 'editor') {
      clearArea();
      defaultRadioButton.checked = true;
    }

    const popup = document.getElementById(button.dataset.closePopup);
    popup.style.display = 'none';

  });
});

openPopupBtns.forEach(button => {
  button.addEventListener('click', () => {
    const popup = document.getElementById(button.dataset.openPopup);
    popup.style.display = 'block';
  });
});



sendTimeBtn.addEventListener('click', () => {
  const validators = fieldValidators[dateInput.name];
  const error = validators.map(validator => validator(dateInput.value)).find(error => error);

  dateInput.closest('.popup__body').querySelector('span').innerHTML = error || '';
  dateInput.style.border = error ? '1px red solid' : 'none';

  if (error) return;

  timestamp = new Date(dateInput.value).getTime() || '';
});
/******************Deadline ***********/

const draggables = document.getElementsByClassName('list__note-container');
