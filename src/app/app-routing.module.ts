import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'camping-checks',
    loadChildren: () =>
      import('./camping-checks-calculation/camping-checks-calculation.module').then(
        (m) => m.CampingChecksCalculationModule,
      ),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
