import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { WPServiceService } from '../wpservice.service';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { PopoverController } from '@ionic/angular';
import { SidePopUpComponent } from '../side-pop-up/side-pop-up.component';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  districts: any;
  newDistricts: any;
  filterTerm: string;
  UniqueID: any;
  firebaseToken: string;
  isSearchClicked: boolean = false;
  isSideMenu: boolean = false;
  constructor(
    private uniqueDeviceID: UniqueDeviceID,
    private wpservice: WPServiceService,
    public popoverController: PopoverController,
    private fcm: FCM,
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private androidPermissions: AndroidPermissions
  ) {
    this.isPlatformReady();
  }

  isPlatformReady() {
    this.platform.ready().then(() => {
      this.getToken();
      this.getPermission();
      document.addEventListener("backbutton", () => {
        console.log('backbutton');
        navigator['app'].exitApp();
        // code that is executed when the user pressed the back button
      });
    })
  }

  getToken() {
    this.fcm.getToken().then(token => {
      console.log(token)
      this.firebaseToken = token;
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      this.firebaseToken = token;
    });
  }

  ionViewDidEnter() {
    this.presentLoading()
    this.wpservice.getData('cowin/').then(data => {
      this.districts = data;
      this.newDistricts = Object.values(this.districts);
    }, err => {
      console.error(err)
    })
  }

  subscribeToNotification(dist){
    let districtId = this.getKeyByValue(this.districts, dist);
    let postData = {
      uuid: this.UniqueID,
      token: this.firebaseToken,
      districtId: districtId
    }
    this.presentLoading()
    this.wpservice.postData('cowin/register', postData).then(data => {
      console.log(data);
      this.filterTerm = '';
      if (data) {
        alert(data.result)
      }
    }, err => {
      this.filterTerm = '';
      console.log(err);
    })
  }

  tapOn(dist) {
    this.presentAlert('Subscibe','Are you sure you want to subscibe notification?',dist)
  }

  getKeyByValue(object, value) {
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (object[prop] === value)
          return prop;
      }
    }
  }

  search() {
    let districts = Object.values(this.districts);
    this.newDistricts = districts.filter((item: string) =>
      item.toLowerCase().indexOf(this.filterTerm.toLowerCase()) >= 0
    )
  }

  unsbscribe(){
    let postData = {
      uuid: this.UniqueID
    }
    this.wpservice.postData('cowin/deregister', postData).then(data => {
      console.log(data);   
      if (data) {
        alert(data.result)
      }
    }, err => {
      console.log(err);
    })
  }

  getPermission() {

    this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_PHONE_STATE
    ).then(res => {
      if (res.hasPermission) {
        this.getUdid()
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(res => {
          this.getUdid()
        }).catch(error => {
          console.log("Error! " + error);
        });
      }
    }).catch(error => {
      console.log("Error! " + error);
    });
  }


  getUdid() {
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        console.log(uuid);
        this.UniqueID = uuid;
      })
      .catch((error: any) => {
        console.log(error);
        // this.UniqueID = "Error! ${error}";
      });

  }
  onSeach(){
    console.log('openmenu');
    this.isSearchClicked =  this.isSearchClicked == true ? false : true;
  }
  onSideMenu(){
    console.log('openmenu');
    this.isSideMenu =  this.isSideMenu == true ? false : true;
    this.presentPopover()
  }
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: SidePopUpComponent,
      cssClass: 'my-custom-class',
     // event: ev,
     animated: true,
     componentProps: {
       onclick: () =>{
         popover.dismiss()
       }
     }
    });
    await popover.present();

    await popover.onDidDismiss().then(()=>{
      this.unsbscribe();
    })
  
  }

  async presentAlert(title,body,data) {
    const alert = await this.alertController.create({
     // cssClass: 'my-custom-class',
      header: title,
   //   subHeader: title,
      message: body,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            alert.dismiss();
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.subscribeToNotification(data);
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

}
