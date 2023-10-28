import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

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
  return schema.validate(url)
    .then(() => {})
    .catch((e) => e);
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
  };

  const state = {
    process: null,
    addedUrls: [],
    form: {
      status: null,
      fields: {
        url: null,
      },
      errors: {},
      messageKey: null,
    },
  };

  const watchedState = onChange(state, render(elements, state, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.process = 'adding';
    watchedState.form.fields.url = formData.get('url');
    validate(watchedState.form.fields, watchedState.addedUrls)
      .then((result) => {
        if (_.isEmpty(result)) {
          watchedState.addedUrls.push(watchedState.form.fields.url);
          watchedState.form.errors = {};
          watchedState.form.hasErrors = false;
        } else {
          watchedState.form.errors[result.path] = result;
          watchedState.form.messageKey = result.message;
          watchedState.form.hasErrors = true;
        }
      });
  });
};

export default app;
