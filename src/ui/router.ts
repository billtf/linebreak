export type ScreenId = 'title' | 'play' | 'pause' | 'results' | 'options';

export interface Router {
  screen: ScreenId;
  go(next: ScreenId): void;
}

export function createRouter(initial: ScreenId = 'title'): Router {
  return {
    screen: initial,
    go(next) {
      this.screen = next;
    },
  };
}
