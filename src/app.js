import * as yup from 'yup';
import { uniqueId } from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import makeWatchedState, { isPostShowed } from './view.js';
import ru from './locales/ru.js';
import parseRss from './parser.js';

const milisecondsValue = 5000;

const normalizeLink = (link) => {
  const proxyLink = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return `${proxyLink}${link}`;
};

const addLinkListener = (linkEl, state) => {
  const watchedState = state;
  linkEl.addEventListener('click', (event) => {
    const postId = event.target.dataset.id;
    if (isPostShowed(watchedState, postId)) {
      return;
    }
    watchedState.lastClickedElement = event.target;
    watchedState.showedPostsIds.push(postId);
  });
};

const addButtonListener = (buttonEl, state) => {
  const watchedState = state;
  buttonEl.addEventListener('click', (event) => {
    const postId = event.target.dataset.id;
    if (isPostShowed(watchedState, postId)) {
      return;
    }
    watchedState.lastClickedElement = document.querySelector(`a[data-id="${postId}"]`);
    const modalShowPost = watchedState.posts.find((post) => post.id === buttonEl.dataset.id);
    watchedState.currentModalShowPost = modalShowPost;
    watchedState.showedPostsIds.push(postId);
  });
};

const updateNewPosts = (state) => {
  const watchedState = state;

  const promises = watchedState.feeds
    .map((feed) => {
      const updatedPosts = axios.get(normalizeLink(feed.url))
        .then((content) => parseRss(content.data.contents))
        .then((parsedRss) => {
          const posts = parsedRss.posts
            .map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
          return posts;
        });
      return updatedPosts;
    });

  const promise = Promise.all(promises);
  promise.then((posts) => {
    const updatedPosts = posts.flat();
    const addedLinks = watchedState.posts.map((addedPost) => addedPost.link);
    const newPosts = updatedPosts.filter((updatedPost) => !addedLinks.includes(updatedPost.link));
    watchedState.posts.unshift(...newPosts);

    const linkElements = document.querySelectorAll('.posts a');
    const buttonElements = document.querySelectorAll('.posts button');

    linkElements.forEach((link) => {
      addLinkListener(link, watchedState);
    });

    buttonElements.forEach((button) => {
      addButtonListener(button, watchedState);
  })
  
  setTimeout(() => updateNewPosts(watchedState), milisecondsValue);
});

const validate = (url, addedUrls) => {
  yup.setLocale({
    mixed: {
      required: 'urlRequired',
      notOneOf: 'existedUrl',
    },
    string: {
      url: 'invalidUrl',
    },
  });

  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(addedUrls),
  });
  return schema.validate(url);
};

const app = () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackElement: document.querySelector('p.feedback'),
    fields: {
      url: document.querySelector('#url-input'),
    },
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    readFullButton: document.querySelector('.full-article'),
  };

  const state = {
    feeds: [],
    posts: [],
    showedPostsIds: [],
    lastClickedElement: null,
    currentModalShowPost: null,
    form: {
      fields: {
        url: null,
      },
      errors: {},
      hasErrors: null,
      messageKey: null,
    },
  };

  const watchedState = makeWatchedState(elements, state, i18nInstance);

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentURL = formData.get('url');
    watchedState.form.fields.url = currentURL;
    const addedUrls = watchedState.feeds.map((feed) => feed.url);

    validate(watchedState.form.fields, addedUrls)
      .then(() => {
        watchedState.form.errors = {};
        const response = axios.get(normalizeLink(currentURL));
        return response;
      })
      .then((content) => parseRss(content.data.contents, watchedState))
      .then((parsedRss) => {
        const feed = {
          id: uniqueId(),
          url: currentURL,
          title: parsedRss.flowTitle,
          description: parsedRss.flowDescription,
        };
        const posts = parsedRss.posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
        watchedState.form.hasErrors = false;
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
      })
      .then(() => {
        const linkElements = document.querySelectorAll('.posts a');
        const buttonElements = document.querySelectorAll('.posts button');

        linkElements.forEach((link) => {
          addLinkListener(link, watchedState);
        });

        buttonElements.forEach((button) => {
          addButtonListener(button, watchedState);
        });
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          watchedState.form.messageKey = error.message;
        }

        if (error.name === 'AxiosError') {
          watchedState.form.messageKey = 'networkError';
        }

        watchedState.form.hasErrors = true;
        console.log(error);
      });
  });

  updateNewPosts(watchedState);
};

export default app;
