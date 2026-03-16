import { Menu } from './menu';
import { ScrollToTop } from './scroll-to-top';

import styles from './toolbar.module.css';

export function Toolbar() {
  return (
    <div className={styles.container}>
      <ScrollToTop />
      <Menu />
    </div>
  );
}
