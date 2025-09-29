import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import generatedSidebar from './docs/sidebar';

const makeCollapsible = (sidebar: any[]): any[] => {
  return sidebar.map(item => {
    if (item.type === 'category') {
      return {
        ...item,
        collapsible: true,
        collapsed: true,
        items: item.items ? makeCollapsible(item.items) : item.items
      };
    }
    return item;
  });
};

const sidebars: SidebarsConfig = {
  apiSidebar: makeCollapsible(generatedSidebar),
};

export default sidebars;
