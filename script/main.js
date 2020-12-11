const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2"; // Подключаем папку с шириной и высотой картинки
const API_KEY = "5cee9631f145f67f23655ab9550162f6"; // Подключаем API
const SERVER = 'https://api.themoviedb.org/3';

// меню

const leftMenu = document.querySelector('.left-menu'), // Подключаем класс leftMenu
	hamburger = document.querySelector('.hamburger'), // Подключаем класс hamburger
	tvShowsList = document.querySelector('.tv-shows__list'), // Подключаем класс tvShowsList
	modal = document.querySelector('.modal'), // Подключаем класс modal
	tvShows = document.querySelector('.tv-shows'),
	tvCardImg = document.querySelector('.tv-card__img'),
	modalTitle = document.querySelector('.modal__title'),
	genresList = document.querySelector('.genres-list'),
	rating = document.querySelector('.rating'),
	description = document.querySelector('.description'),
	modalLink = document.querySelector('.modal__link'),
	searchForm = document.querySelector('.search__form'),
	searchFormInput = document.querySelector('.search__form-input'),
	notFound = document.querySelector('.not_found'),
	imageContent = document.querySelector('.image__content');

const loading = document.createElement('div');
loading.className = 'loading';

class DBService { // Создаём класс DBService
	getData = async (url) => { // Получаем асинхронно url
		const res = await fetch(url); // Создаём константу, ждём, и берём тот самый url
		if(res.ok) { // Создаём условие при истине возвращаем url на json
			return res.json();
		} else { // Иначе пишем ошибку
			throw new Error(`Не удалось получить данные
				по адресу ${url}`)
		}
	}

	getTestData = async () => { // Передаём асинхронно данные из test.json
		return this.getData('test.json');
	}

	getTestCard = () => {
		return this.getData('card.json');
	}

	getSearchResult = query => {
		return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
	}

	getTvShow = id => {
		return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
	}
}

const renderCard = response => {
	console.log(response);
	tvShowsList.textContent = ``; // Очищаем tvShowsList
	if(response.results.length == 0) {
		loading.remove();
		notFound.classList.remove('hide');
	} else {
		notFound.classList.add('hide');
		response.results.forEach(item => { // Перебираем массив из данных test.json
			const {  // Укорощаем их названия и присваиваем их item
				backdrop_path : backdrop,
				name : title, 
				poster_path : poster,
				vote_average : vote,
				id
			} = item;


			const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg'; // Если poster равен true то пишем ссылку, иначе вставляем ссылку на no-poster
			const backdropIMG = backdrop ? IMG_URL + backdrop : ''; // Если есть ссылка в backdrop то пишем ссылку, иначе ничего не вставляем

			const card = document.createElement('li'); // Создаём тэг li
			card.className = 'tv-shows__item'; // Присваеваем ему класс tv-shows__item


			const voteElem = vote == 0 ? // Если рейтинг равен 0 то записываем данные без тэга span, иначе с ним
			`
				<a href="#" id="${id}" class="tv-card">
		            <img class="tv-card__img"
		                 src="${posterIMG}"
		                 data-backdrop="${backdropIMG}"
		                 alt="${title}">
		            <h4 class="tv-card__head">${title}</h4>
		        </a>
		    ` 
		    :
		    `
		    	<a href="#" id="${id}" class="tv-card">
		            <span class="tv-card__vote">${vote}</span>
		            <img class="tv-card__img"
		                 src="${posterIMG}"
		                 data-backdrop="${backdropIMG}"
		                 alt="${title}">
		            <h4 class="tv-card__head">${title}</h4>
		        </a>
		    `;
			card.innerHTML = voteElem;
			loading.remove();
			tvShowsList.append(card); // Записываем данные в конце
		});
	}
};

// Поиск

searchForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const value = searchFormInput.value.trim();
	if(value) {
		tvShows.append(loading);
		new DBService().getSearchResult(value).then(renderCard);
	}
	searchFormInput.value = '';
});

// открытие/закрытие меню

hamburger.addEventListener('click', () => { // Если кликнул на Гамбургер или на leftMenu, то открываем меню
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => { // Если кликнул на документ, то закрываем меню
	if (!event.target.closest('.left-menu')) {
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');
	}
});

leftMenu.addEventListener('click', event => { // Если кликнул на leftMenu, то закрываем его
	event.preventDefault();
	const target = event.target;
	const dropdown = target.closest('.dropdown');
	if (dropdown) {
		dropdown.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		hamburger.classList.add('open');
	}
});

// Карточки


const changeImage = event => {
	const card = event.target.closest('.tv-shows__item');

	if(card) {
		const img = card.querySelector('.tv-card__img');
		const changeImg = img.dataset.backdrop;
		if(changeImg) {
			img.dataset.backdrop = img.src;
			img.src = changeImg;
		}
	}
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

// открытие модального окна


tvShowsList.addEventListener('click', event => {
	event.preventDefault();
	const target = event.target;
	const card = target.closest('.tv-card');
	if(card) {
		tvShows.append(loading);
		new DBService().getTvShow(card.id)
			.then(data => {
				console.log(data.backdrop_path);
				if(data.backdrop_path === null) {
					imageContent.classList.add('hide');
					modalTitle.textContent = data.name;
					 //gebresList.innerHTML(data.genres.reduce((acc, item) => {
					 	//return `${acc}<li>${item.name}</li>`;
					 //}, ''));
					tvCardImg.alt = data.name;
					genresList.textContent = '';
					for (const item of data.genres) {
						genresList.innerHTML += `<li>${item.name}</li>`;
					}
					rating.textContent = data.vote_average;
					description.textContent = data.overview;
					modalLink.href = data.homepage;
				} else {
					imageContent.classList.remove('hide');
					tvCardImg.src = IMG_URL + data.poster_path;
					modalTitle.textContent = data.name;
					 //gebresList.innerHTML(data.genres.reduce((acc, item) => {
						//return `${acc}<li>${item.name}</li>`;
					 //}, ''));
					tvCardImg.alt = data.name;
					genresList.textContent = '';
					for (const item of data.genres) {
						genresList.innerHTML += `<li>${item.name}</li>`;
					}
					rating.textContent = data.vote_average;
					description.textContent = data.overview;
					modalLink.href = data.homepage;
				}
			})
			.then(() => {
				document.body.style.overflow = 'hidden';
				modal.classList.remove('hide');
				loading.remove();
			})


	}
});

// закрытие

modal.addEventListener('click', () => {
	if(event.target.closest('.cross') ||
		event.target.classList.contains('modal')) {
		document.body.style.overflow = '';
		modal.classList.add('hide');
	}
});

// 1:08:16