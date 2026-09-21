import React, { type ReactNode } from "react";
import Footer from "../components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={styles.container}>
      <main style={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};

const styles: {
  container: React.CSSProperties;
  main: React.CSSProperties;
} = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
  },
  main: {
    flex: 1,
  },
};

export default MainLayout;