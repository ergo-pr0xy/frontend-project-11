import { has } from 'lodash';

const renderPosts = (elements, state, i18n) => {
  if (state.posts.length === 0) {
    return;
  }

  const { posts: postElements } = elements;
  postElements.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('posts');
  cardBody.append(cardTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  const posts = state.posts
    .map((post) => {
      const postEl = document.createElement('li');
      postEl.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );

      const link = document.createElement('a');
      link.setAttribute('href', post.link);
      link.setAttribute('class', 'fw-bold');
      link.setAttribute('data-id', post.id);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
      link.setAttribute('rel', 'noreferrer');
      link.textContent = post.title;

      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-id', post.id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18n.t('buttons.view');

      postEl.append(link, button);
      return postEl;
    });
  postsList.append(...posts);
  card.append(cardBody, postsList);
  postElements.append(card);
};

const renderFeeds = (elements, state, i18n) => {
  const { feeds: feedElements } = elements;
  feedElements.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('feeds');
  cardBody.append(cardTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  const feeds = state.feeds.map((feed) => {
    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    feedEl.append(feedTitle, feedDescription);
    return feedEl;
  });
  feedsList.append(...feeds);
  card.append(cardBody, feedsList);
  feedElements.append(card);
};

const renderFeedback = (elements, state, i18n) => {
  const { feedbackElement } = elements;

  if (!state.form.hasErrors) {
    feedbackElement.textContent = i18n.t('messageTexts.correctUrl');
    feedbackElement.classList.add('text-success');
    feedbackElement.classList.remove('text-danger');
    return;
  }
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  const messagePath = `messageTexts.${state.form.messageKey}`;
  feedbackElement.textContent = i18n.t(messagePath);
};

const renderErrors = (elements, state, errors, prevErrors, i18n) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const fieldHasError = has(errors, fieldName);
    const fieldHadError = has(prevErrors, fieldName);

    if (!fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, state, i18n);
      elements.form.reset();
      elements.fields.url.focus();
      return;
    }

    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, state, i18n);
      return;
    }

    if ((!fieldHadError && fieldHasError) || (fieldHadError && fieldHasError)) {
      fieldElement.classList.add('is-invalid');
      renderFeedback(elements, state, i18n);
    }
  });
};

const render = (elements, state, i18n) => (path, value, prevValue) => {
  switch (path) {
    case 'form.hasErrors':
      renderErrors(elements, state, value, prevValue, i18n);
      break;
    case 'feeds':
      renderFeeds(elements, state, i18n);
      break;
    case 'posts':
      renderPosts(elements, state, i18n);
      break;
    default:
      break;
  }
};

export default render;
