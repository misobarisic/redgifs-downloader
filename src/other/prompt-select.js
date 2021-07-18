'use strict';

const kleur = require('kleur');
const List = require('prompt-list');

class Select extends List {
  constructor(options = {}) {
    super(options);
    this.action('number', (index, key) => this.onNumber(index, key));
    this.action('space', index => this.onSpace(index));
    this.rl.removeListener('SIGINT', this.ui.forceClose);
    process.removeListener('exit', this.ui.forceClose);
  }

  end(state) {
    super.end(state);
  }

  renderChoice(choices) {
    return function (line) {
      const selected = choices.get(choices.position);
      return this === selected ? kleur.yellow(line) : line;
    };
  }

  renderHelp() {
    return '';
  }

  renderMessage() {
    return '';
  }

  submitAnswer(key) {
    const selected = this.choices.getChoice(key);
    this.emit('select', selected);
  }

  onNumber(index, { value }) {
    const choice = this.choices.get(value - 1);
    if (!choice) return index;
    return choice.index;
  }

  onSpace(index) {
    this.emit('select', this.choices.get(index));
    return index;
  }
}

module.exports = Select;
