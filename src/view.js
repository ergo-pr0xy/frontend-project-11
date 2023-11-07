import { has } from 'lodash';

const isPostReaded = (state, postId) => state.readedPostsIds.includes(postId);

const renderModalElement = (elements, post) => {
  const { modalTitle, modalBody, readFullButton } = elements;
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  readFullButton.setAttribute('href', post.link);
};

const renderReadedPost = (clickedLink) => {
  const readedLink = clickedLink;
  readedLink.classList.remove('fw-bold');
  readedLink.classList.add('fw-normal', 'link-secondary');
};

const makePostElement = () => {
  const postEl = document.createElement('li');
  postEl.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );
  return postEl;
};

const makeLinkElement = (state, post) => {
  const linkEl = document.createElement('a');
  linkEl.setAttribute('href', post.link);
  linkEl.setAttribute('data-id', post.id);
  linkEl.setAttribute('target', '_blank');
  linkEl.setAttribute('rel', 'noopener noreferrer');
  linkEl.textContent = post.title;

  if (isPostReaded(state, linkEl.dataset.id)) {
    linkEl.classList.add('fw-normal', 'link-secondary');
  } else {
    linkEl.classList.add('fw-bold');
  }

  linkEl.addEventListener('click', (event) => {
    if (isPostReaded(state, linkEl.dataset.id)) {
      return;
    }
    state.readedPostsIds.push(linkEl.dataset.id);
    renderReadedPost(event.target);
  });

  return linkEl;
};

const makeButtonElement = (elements, state, i18nInstance, post) => {
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('type', 'button');
  buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  buttonEl.setAttribute('data-id', post.id);
  buttonEl.setAttribute('data-bs-toggle', 'modal');
  buttonEl.setAttribute('data-bs-target', '#modal');
  buttonEl.textContent = i18nInstance.t('buttons.view');

  buttonEl.addEventListener('click', () => {
    renderModalElement(elements, post);
    if (isPostReaded(state, buttonEl.dataset.id)) {
      return;
    }
    state.readedPostsIds.push(buttonEl.dataset.id);
    const clickedLink = document.querySelector(`a[data-id="${buttonEl.dataset.id}"`);
    renderReadedPost(clickedLink);
  });

  return buttonEl;
};

const makeFeedElement = (feed) => {
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
};

const makeCardSample = (i18nInstance) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t('posts');

  cardBody.append(cardTitle);
  card.append(cardBody);

  return card;
};

const renderPosts = (elements, state, i18n) => {
  if (state.posts.length === 0) {
    return;
  }

  const { posts: postElements } = elements;
  postElements.innerHTML = '';
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  const posts = state.posts
    .map((post) => {
      const postEl = makePostElement();
      const link = makeLinkElement(state, post);
      const button = makeButtonElement(elements, state, i18n, post);
      postEl.append(link, button);
      return postEl;
    });

  postsList.append(...posts);
  const card = makeCardSample(i18n);
  card.append(postsList);
  postElements.append(card);
};

const renderFeeds = (elements, state, i18n) => {
  const { feeds: feedElements } = elements;
  feedElements.innerHTML = '';

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  const feeds = state.feeds.map((feed) => {
    const feedEl = makeFeedElement(feed);
    return feedEl;
  });

  feedsList.append(...feeds);
  const card = makeCardSample(i18n);
  card.append(feedsList);
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
