import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background m-auto w-[1250px]">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">About Us</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} E-Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
