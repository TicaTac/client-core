import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { mapTo, switchMap } from "rxjs/operators";
import { Subject, timer } from "rxjs";
import { DatoSnackbar } from "../../../../../../lib";

@Component({
  selector: "dato-select-preview",
  templateUrl: "./select-preview.component.html",
  styleUrls: ["./select-preview.component.scss"]
})
export class SelectPreviewComponent implements OnInit {
  private subject = new Subject();

  simpleControl = new FormControl({ id: 1, label: "Item 1" });
  simpleControlSearch = new FormControl();
  simpleControlSearch2 = new FormControl();
  simpleControlSearch3 = new FormControl();
  asyncControl = new FormControl();
  controlDisabled = new FormControl();
  activeTplControl = new FormControl();
  groupControl = new FormControl();
  serverSideControl = new FormControl();
  withActionsControl = new FormControl();
  groupControlMulti = new FormControl();
  customFooterControl = new FormControl();
  multiControl = new FormControl();
  multiControl2 = new FormControl([
    { id: 1, label: "Item 1" },
    { id: 5, label: "Item 5" }
  ]);
  multiControl3 = new FormControl();
  multiDisableControl = new FormControl([
    { id: 1, label: "Item 1" },
    { id: 2, label: "Item 2" }
  ]);

  options$ = this.subject.asObservable();
  options = [];
  optionsFromServer;

  constructor(private snackbar: DatoSnackbar) {
    for (var i = 0, len = 15; i < len; i++) {
      this.options.push({
        label: `Item ${i + 1}`,
        id: i + 1
      });
    }

    setTimeout(() => {
      this.subject.next(this.options);
    }, 500);

    this.optionsFromServer = this.options.slice();
  }

  dynamic;

  ngOnInit() {
    this.controlDisabled.disable();
    this.multiDisableControl.disable();

    this.dynamic = [
      {
        options: this.options.slice()
      },
      {
        options: this.options.slice()
      }
    ];
  }

  toggleDisableEnable() {
    this.controlDisabled.enabled
      ? this.controlDisabled.disable()
      : this.controlDisabled.enable();
  }

  onSearch(term: string) {
    this.getNewItems(term).subscribe(res => {
      this.optionsFromServer = res;
      this.isLoading = false;
    });
  }

  grouped = [
    {
      label: "A",
      children: [
        { id: 1, label: "abc" },
        { id: 2, label: "efg" },
        { id: 3, label: "hij" }
      ]
    },
    {
      label: "B",
      children: [{ id: 4, label: "klm" }]
    },
    {
      label: "C",
      children: [{ id: 5, label: "nop" }]
    }
  ];

  _optionsFromServer = [
    { id: 1, label: "abc" },
    { id: 2, label: "efg" },
    { id: 3, label: "hij" },
    { id: 4, label: "klm" },
    { id: 5, label: "nop" }
  ];

  isLoading = false;

  update() {
    this.asyncControl.patchValue({ ...this.options[2] });
  }

  getNewItems(term) {
    this.isLoading = true;

    return timer(500).pipe(
      mapTo(this._optionsFromServer.filter(item => item.label.includes(term)))
    );
  }

  onSave() {
    this.snackbar.success("Success!!!");
  }
}