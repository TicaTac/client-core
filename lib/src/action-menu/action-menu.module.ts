/**
 * @license
 * Copyright Datorama. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License 2.0 license that can be
 * found in the LICENSE file at https://github.com/datorama/client-core/blob/master/LICENSE
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatoActionMenuComponent } from './action-menu.component';
import { DatoActionMenuItemComponent } from './action-menu-item.component';

const components = [DatoActionMenuComponent, DatoActionMenuItemComponent];

@NgModule({
  imports: [CommonModule],
  declarations: components,
  exports: components
})
export class DatoActionMenuModule {}
