import { Component } from '@angular/core';
import {  AlertController, Platform } from '@ionic/angular';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private fcm:FCM,public alertController: AlertController) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      this.fcm.onNotification().subscribe(data => {
        if (data.wasTapped) {
          console.log("Received in background");
        } else {
           console.log(data)
           this.presentAlert(data.title,data.body)
          console.log("Received in foreground");
        };
      });
      //  this.statusBar.show();
      //  this.statusBar.styleLightContent()
      //  this.statusBar.backgroundColorByHexString('#003034');
    });
  }


  async presentAlert(title,body) {
    const alert = await this.alertController.create({
     // cssClass: 'my-custom-class',
      header: title,
   //   subHeader: title,
      message: body,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
 

}
