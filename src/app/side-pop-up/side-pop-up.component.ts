import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-side-pop-up',
  templateUrl: './side-pop-up.component.html',
  styleUrls: ['./side-pop-up.component.scss'],
})
export class SidePopUpComponent implements OnInit {
  @Input()
  public onClick = () => {}
  
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {

  }

  async unsbscribe() {
    await this.popoverController.dismiss();
  }
}
