import * as yup from 'yup';
import { uniqueId } from 'lodash';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import render from './view.js';
import ru from './locales/ru.js';
import parseRss from './parser.js';

const normalizeLink = (link) => {
  const proxyLink = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return `${proxyLink}${link}`;
};

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
  };

  const state = {
    process: null,
    feeds: [],
    posts: [],
    form: {
      status: null,
      fields: {
        url: null,
      },
      errors: {},
      hasErrors: null,
      messageKey: null,
    },
  };

  const watchedState = onChange(state, render(elements, state, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentURL = formData.get('url');
    watchedState.form.fields.url = currentURL;
    const addedUrls = state.feeds.map((feed) => feed.url);
    validate(watchedState.form.fields, addedUrls)
      .then(() => {
        watchedState.form.errors = {};
        watchedState.form.hasErrors = false;
        const response = axios.get(normalizeLink(currentURL));
        return response;
      })
      .then((content) => parseRss(content.data.contents))
      .then((parsedRss) => {
        const feed = {
          id: uniqueId(),
          url: currentURL,
          title: parsedRss.flowTitle,
          description: parsedRss.flowDescription,
        };
        const posts = parsedRss.posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
        watchedState.feeds.push(feed);
        watchedState.posts.push(...posts);
      })
      .catch((error) => {
        watchedState.form.errors[error.path] = error;
        watchedState.form.messageKey = error.message;
        watchedState.form.hasErrors = true;
        console.log(error);
      });
  });
};

export default app;
