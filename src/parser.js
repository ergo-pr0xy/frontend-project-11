export default (string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error.textContent);
  }
  const flowTitle = doc.querySelector('channel title').textContent;
  const flowDescription = doc.querySelector('channel description').textContent;
  const itemElems = doc.querySelectorAll('item');
  const posts = Array.from(itemElems).map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title,
      description,
      link,
    };
  });

  return {
    flowTitle,
    flowDescription,
    posts,
  };
};
