import { Presenter } from '../ports/interfaces.js';

export class VersionPresenter extends Presenter {
  format(version) {
    return { version };
  }

  formatError(error) {
    return {
      error: error.message
    };
  }
}

export const presenter = new VersionPresenter(); 