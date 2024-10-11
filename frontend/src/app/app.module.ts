import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ThreeViewerComponent } from './three-viewer/three-viewer.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HeaderComponent } from './header/header.component';
import { IndexComponent } from './pages/index/index.component';
import { ViewerItemComponent } from './viewer-item/viewer-item.component';

@NgModule({
  declarations: [
    AppComponent,
    ThreeViewerComponent,
    FileUploadComponent,
    HeaderComponent,
    IndexComponent,
    ViewerItemComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
