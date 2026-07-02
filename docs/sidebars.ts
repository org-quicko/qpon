import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import generatedSidebar from './docs/sidebar';

const apiCategories = (generatedSidebar).slice(1);

const sidebars: SidebarsConfig = {
  apisidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'installation',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'API',
      items: [
        {
          type: 'doc',
          id: 'api-introduction',
          label: 'Introduction',
        },
        ...apiCategories,
      ],
    },
  ],
};

export default sidebars;
