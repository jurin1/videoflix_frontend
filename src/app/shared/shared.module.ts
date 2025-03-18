import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { RouterLinkActive } from '@angular/router';
import { RouterLink } from '@angular/router';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule,
    RouterLinkActive,
    RouterLink,
    VideoPlayerComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule,
    RouterLinkActive,
    RouterLink,
    VideoPlayerComponent
  ]
})
export class SharedModule { }