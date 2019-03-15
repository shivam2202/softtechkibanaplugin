import './test_vis.less';
import './custom.css';

import optionsTemplate from './options_template.html';
import { VisController } from './vis_controller';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import {Schemas} from 'ui/vis/editors/default/schemas';

//import './pivottable/dist/jquery.min.js';
//import './pivottable/dist/jquery-ui.min.js';
//import './pivottable/dist/pivot.css';
//import './pivottable/dist/pivot.js';

//import './flexmonster/lib/jquery.min.js';
//import  './flexmonster/flexmonster.js';



function TestVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  //const Schemas = Private(VisSchemasProvider);

  return VisFactory.createBaseVisualization({
    name: 'test_vis',
    title: 'Pivot Table',
    icon: 'visTable',
    description: 'Display values in a pivot table',

    category: CATEGORY.OTHER,
    visualization: VisController,
    visConfig: {
      defaults: {
        // add default parameters
        fontSize: '30'
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          min: 1,
          //max: 1,
		  aggFilter: ['count', 'avg', 'sum'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]

        }, 
		{
          group: 'buckets',
          name: 'row',
          title: 'Row Slice',
          min: 1,
          //max: 1,
          aggFilter: 'terms'
        },
		{
          group: 'buckets',
          name: 'column',
          title: 'Column Slice',
          min: 1,
          //max: 1,
          aggFilter: 'terms'
        }
      ]),
    }
  });
}

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(TestVisProvider);
