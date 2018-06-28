/**
 * @license
 * Copyright Datorama. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License 2.0 license that can be
 * found in the LICENSE file at https://github.com/datorama/client-core/blob/master/LICENSE
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatoListComponent } from './list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatoInputModule, DatoSelectModule } from '../../';

const publicApi = [DatoListComponent];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, DatoInputModule, DatoSelectModule],
  declarations: [publicApi],
  exports: [publicApi],
  entryComponents: [publicApi]
})
export class DatoListModule {}
