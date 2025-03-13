import { Component, Input, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnDestroy, OnChanges {
  @Input() videoUrl: string = '';
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  player: any;
  @Input() showModal: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      setTimeout(() => {
        this.setupPlayer();
      }, 100);
    } else {
      this.destroyPlayer();
    }
  }

  private setupPlayer() {
    this.destroyPlayer();

    setTimeout(() => {
      if (!this.target || !this.target.nativeElement) {
        return;
      }

      try {
        this.player = videojs(this.target.nativeElement, {
          controls: true,
          autoplay: true,
          muted: false,
          preload: 'auto',
          fluid: true,
          sources: [{
            src: this.videoUrl,
            type: 'video/mp4'
          }]
        });

        this.player.ready(() => {
          this.player.play().catch(() => {});
        });

      } catch (error) {}
    }, 300);
  }

  ngOnDestroy() {
    this.destroyPlayer();
  }

  closeModal() {
    this.showModal = false;
    this.destroyPlayer();
  }

  private destroyPlayer() {
    if (this.player) {
      try {
        this.player.pause();
        this.player.dispose();
        this.player = null;
      } catch (e) {}
    }
  }
}