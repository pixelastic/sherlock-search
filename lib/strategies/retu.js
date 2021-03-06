/**
 * Strategy used in:
 * - Return of Sherlock Holmes
 *
 **/
import helper from '../utils/helper.js';
import _ from 'lodash';

const Strategy = {
  process(window) {
    this.$ = window.$;
    return Strategy
      .removeCruft()
      .then(Strategy.getMetadata)
      .then(Strategy.getElements)
      .then(Strategy.removeUnusedTitles)
      .then(Strategy.addChapters)
      // .then(Strategy.debug)
      ;
  },
  // Remove useless parts from the HTML to make further selection easier
  removeCruft() {
    let $ = Strategy.$;
    $('table, pre').remove();

    $('p').each((index, p) => {
      let $p = $(p);
      let text = helper.getNodeContent($p);
      if (!text) {
        $p.remove();
      }
    });

    return Promise.resolve();
  },
  // Find book name and author
  getMetadata() {
    let $ = Strategy.$;
    let h1 = $('h1');
    let firstH1 = $(h1[0]);
    let secondH1 = $(h1[1]);
    let book = helper.getNodeContent(firstH1);
    let author = helper.getNodeContent(secondH1).replace('by ', '');
    return {book, author};
  },
  // Returns all the needed, unfiltered, elements
  getElements(metadata) {
    let $ = Strategy.$;
    let elements = $('h2,p');
    return _.flatten(_.compact(_.map(elements, (element) => {
      let tagName = element.tagName;
      let content = helper.getNodeContent($(element));
      let chunks = helper.splitTextBySentence(content);
      return _.map(chunks, (chunk) => {
        return {...metadata, tagName, content: chunk};
      });
    })));
  },
  // Remove useless titles
  removeUnusedTitles(elements) {
    return _.filter(elements, (element) => {
      if (element.tagName === 'P') {
        return true;
      }
      return /^THE ADVENTURE /.test(element.content);
    });
  },
  // Add chapters name and order
  addChapters(elements) {
    let chapterName = null;
    let chapterOrder = 0;
    let order = 0;

    return _.compact(_.map(elements, (element) => {
      let isTitle = element.tagName === 'H2';
      let content = element.content;
      order++;

      // Set the current chapter
      if (isTitle) {
        order = 0;
        chapterName = content;
        chapterOrder++;
        return null;
      }

      return {...element, chapterOrder, chapterName, order};
    }));
  },
  debug(elements) {
    // console.info(elements);
    return elements;
  }
};
export default Strategy;



