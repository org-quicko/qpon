import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import generatedSidebar from './docs/sidebar';

const sidebars: SidebarsConfig = {
  apiSidebar: generatedSidebar,
};

export default sidebars;
