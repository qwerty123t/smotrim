async function fetchPersonsAndImages() {
  try {
    const response = await fetch('https://cdnapi.smotrim.ru/api/v1/boxes/vesti2');
    
    if (!response.ok) {
      throw new Error('Проблема с интернетом');
    }

    const data = await response.json();
    const result = data.data.content.find(item => item.title === 'Персоны');

    if (!result || !result.content) {
      throw new Error('Не найдены данные для "Персоны"');
    }

    const persons = result.content.map(person => ({
      ...person,
      imgSrc: `https://cdnapi.smotrim.ru/api/v1/pictures/${person.picId}/bq/redirect`,
      description: null,
    }));

    renderPersons(persons);
  } catch (error) {
    console.error('Ошибка получения данных:', error);
  }
}

// Запуск функции загрузки данных
fetchPersonsAndImages();

function renderPersons(persons) {
  const personElements = document.querySelectorAll('.person');

  persons.forEach((person, index) => {
    if (personElements[index]) {
      const imgElement = personElements[index].querySelector('.person-img');
      const nameElement = personElements[index].querySelector('.person-name');
      const surnameElement = personElements[index].querySelector('.person-surname');

      updatePersonInfo(person, imgElement, nameElement, surnameElement);

      personElements[index].addEventListener('click', () => {
        showPopover(person);
        if (!person.description) {
          loadDescriptionAndUpdatePopover(person);
        }
      });
    }
  });
}

function updatePersonInfo(person, imgElement, nameElement, surnameElement) {
  imgElement.src = person.imgSrc;
  nameElement.textContent = person.name;
  surnameElement.textContent = person.surname;
  imgElement.alt = `${person.name} ${person.surname}`;
}

async function loadDescriptionAndUpdatePopover(person) {
  try {
    const response = await fetch(`https://cdnapi.smotrim.ru/api/v1/persons/${person.id}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных о персоне: ${person.name}`);
    }

    const personData = await response.json();
    person.description = personData.data.body;

    updatePopoverWithDescription(person);
  } catch (error) {
    console.error(`Ошибка загрузки данных для ${person.name}:`, error);
  }
}

function showPopover(person) {
  const popover = document.getElementById('person-popover');
  const popoverImg = popover.querySelector('.popover-img');
  const popoverName = popover.querySelector('.popover-name');
  const popoverSurname = popover.querySelector('.popover-surname');
  const popoverText = popover.querySelector('.popover-text');

  updatePersonInfo(person, popoverImg, popoverName, popoverSurname);

  popoverText.innerHTML = person.description || 'Загрузка описания...';
}

function updatePopoverWithDescription(person) {
  const popover = document.getElementById('person-popover');
  const popoverText = popover.querySelector('.popover-text');

  popoverText.innerHTML = person.description;
}




// Прокрутка галереи
const personWidth = 176;
const gallery = document.getElementById('gallery');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

function updateButtons() {
  leftButton.classList.toggle('hidden', gallery.scrollLeft <= 50);
  rightButton.classList.toggle('hidden', gallery.scrollLeft + gallery.offsetWidth >= gallery.scrollWidth - 50);
}

gallery.addEventListener('scroll', updateButtons);

// Функция с debounce для кнопок, чтобы избежать частого нажатия
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

leftButton.addEventListener('click', debounce(() => {
  gallery.scrollTo({
    left: gallery.scrollLeft - personWidth,
    behavior: 'smooth'
  });
}, 20));

rightButton.addEventListener('click', debounce(() => {
  gallery.scrollTo({
    left: gallery.scrollLeft + personWidth,
    behavior: 'smooth'
  });
}, 20));

