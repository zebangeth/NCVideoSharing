import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image width={80} height={80}
          src="/logo_transparent.png" alt="TennisTube Logo"/>
      </Link>
    </nav>
  );
}
