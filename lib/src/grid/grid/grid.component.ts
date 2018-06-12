/**
 * @license
 * Copyright Datorama. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License 2.0 license that can be
 * found in the LICENSE file at https://github.com/datorama/client-core/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, Output, ViewEncapsulation } from '@angular/core';
import { ColumnApi, GridApi, GridOptions, GridReadyEvent } from 'ag-grid';
import { IconRegistry } from '../../services/icon-registry';
import { getGridIcons } from './grid-icons';
import { BaseCustomControl } from '../../internal/base-custom-control';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceArray } from '@datorama/utils';
import { DatoGridAPI } from '../dato-grid-api';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { take } from 'rxjs/operators';
import { DatoGridHelper } from '../grid-helper';
import { DatoCoreError } from '../../errors';
import { ColDef, ColGroupDef } from 'ag-grid/src/ts/entities/colDef';

export type ExtendedGridOptions = {
  onRowDataUpdated: (event) => void;
};
export type DatoGridOptions = ExtendedGridOptions & GridOptions;

const valueAccessor = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatoGridComponent),
  multi: true
};

@Component({
  selector: 'dato-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [valueAccessor]
})
export class DatoGridComponent extends BaseCustomControl implements ControlValueAccessor {
  @Output() rowDataChanged = new EventEmitter();

  private defaultGridOptions: DatoGridOptions = {
    // Replace the build-in pagination
    suppressPaginationPanel: true,
    pagination: true,
    onRowDataChanged: event => {
      this.rowDataChanged.emit(event);
    },
    onRowDataUpdated: event => {
      this.rowDataChanged.emit(event);
    },
    onSelectionChanged: event => {
      const selectedRows = this.api.getSelectedRows();
      this.onChange(selectedRows);
    },
    rowSelection: 'multiple',
    rowDeselection: true,
    icons: {},
    unSortIcon: true,
    toolPanelSuppressSideButtons: true,
    showToolPanel: false,
    animateRows: true
  };

  private hasInfinitePagination = false;

  api: DatoGridAPI<any>;
  gridColumnApi: ColumnApi;
  gridOptions: DatoGridOptions;

  @HostBinding('class.grid-pagination') hasPagination = true;

  @Input() enableSorting = true;
  @Input() enableFilter = true;
  @Input() enableColResize = true;

  @Input()
  set options(options: DatoGridOptions) {
    options.columnDefs = this.gridHelper.translateColumns(options.columnDefs);
    this.gridOptions = { ...this.defaultGridOptions, ...options };
    // check if we got a pagination
    this.hasPagination = this.gridOptions.pagination;
    this.hasInfinitePagination = this.gridOptions.rowModelType === 'infinite';
  }

  get options(): DatoGridOptions {
    return this.gridOptions;
  }

  @Output() gridReady = new EventEmitter<GridReadyEvent>();

  constructor(private gridHelper: DatoGridHelper, private element: ElementRef, private iconRegistry: IconRegistry, private cdr: ChangeDetectorRef) {
    super();

    this.api = new DatoGridAPI();
    this.defaultGridOptions.icons = getGridIcons(iconRegistry);
    this.gridOptions = { ...this.defaultGridOptions };
  }

  /**
   * On grid ready
   * @param {GridReadyEvent} event
   */
  onGridReady(event: GridReadyEvent) {
    // set grid API
    this.api.gridApi = event.api;
    this.gridColumnApi = event.columnApi;

    this.cdr.detectChanges();
    this.gridReady.emit(event);
  }

  /**
   * call ag-grid's size all columns to fit to container
   */
  fitToContainer(): void {
    this.gridOptions.api.sizeColumnsToFit();
  }

  /**
   * call ag-grid's size all columns to fit to content
   */
  fitToContent(): void {
    this.gridOptions.columnApi.autoSizeAllColumns();
    const { width } = this.element.nativeElement.getBoundingClientRect();
    const agBody = this.element.nativeElement.querySelector('.ag-body-container');
    const bodyWidth: number = agBody ? agBody.clientWidth : 0;
    if (width > bodyWidth) {
      this.fitToContainer();
    }
  }

  /**
   * Updaet the columns definitions
   * @param {(ColDef | ColGroupDef)[]} columnDefs
   */
  updateColumns(columnDefs: (ColDef | ColGroupDef)[]) {
    this.gridHelper.updateColumns(this.api.gridApi, columnDefs);
  }

  writeValue(obj: any): void {
    const rows = obj ? coerceArray(obj) : [];

    if (this.api.ready) {
      this.api.setSelectedRows(rows);
    } else {
      // wait for the grid to be ready and the data has been set
      combineLatest(this.rowDataChanged, this.gridReady)
        .pipe(take(1))
        .subscribe(() => {
          this.api.setSelectedRows(rows);
        });
    }
  }
}
