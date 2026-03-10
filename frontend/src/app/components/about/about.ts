import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent {
  facts = [
    { icon: '📊', title: '2.5 quintillion bytes', body: 'of data are created every single day — making synthesis more valuable than ever.' },
    { icon: '⏱️', title: '23 hours', body: 'is the average time a professional researcher spends on a single literature review.' },
    { icon: '🎯', title: '80% of decisions', body: 'in business are made with incomplete or poorly synthesized information.' },
    { icon: '🧠', title: 'Deep work is rare', body: 'Only 16% of knowledge workers report having time for deep, focused research.' },
    { icon: '📚', title: '2M+ papers/year', body: 'are published on ArXiv alone — impossible to track without intelligent filtering.' },
  ];
}