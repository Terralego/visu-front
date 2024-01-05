/* eslint-disable import/no-extraneous-dependencies */
import PopperJs from 'popper.js';

export default class Popper {
  constructor () {
    this.placements = PopperJs.placements;

    return {
      update: () => {},
      destroy: () => {},
      scheduleUpdate: () => {},
    };
  }
}
