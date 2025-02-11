import { Routes } from '@angular/router';
import { WordCloudsComponent } from './word-clouds/word-clouds.component';
import { WordCloudDetailComponent } from './word-cloud-detail/word-cloud-detail.component';
import { wordcloudResolver } from './word-cloud-detail/wordcloud.resolver';

export const routes: Routes = [{
     path: 'word-clouds', component: WordCloudsComponent 
   
},
{
     path: 'word-clouds/:id', component: WordCloudDetailComponent, 
     runGuardsAndResolvers: 'paramsOrQueryParamsChange', 
    // resolve: {wordCloud : wordcloudResolver }
   
},
{ path: '', redirectTo: 'word-clouds', pathMatch: 'full' },
{ path: '**', redirectTo: 'word-clouds' } 

];
