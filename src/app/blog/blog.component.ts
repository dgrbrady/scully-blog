import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, ROUTES } from '@angular/router';
import { SyntaxHighlightService } from '../services/syntax-highlight.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  preserveWhitespaces: true,
  encapsulation: ViewEncapsulation.Emulated,
})
export class BlogComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private syntaxHighlightService: SyntaxHighlightService,
    @Inject(DOCUMENT) private document: Document,
    private renderer2: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.fixTocLinks();
    this.syntaxHighlightService.highlightAll();
  }

  private fixTocLinks() {
    const tocSelector = 'h2#toc ~ ul';
    const toc = this.document.querySelector<HTMLUListElement>(tocSelector);
    if (toc) {
      const links = toc.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        const route = this.route.snapshot.url.toString();
        this.renderer2.setAttribute(link, 'href', `blog/${route}${href}`);
      });
    }
  }
}
