import React from 'react'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Header placeholder */}
      <header className="layout-header">
        <div className="header-content">
          <h1 className="header-title">StakeHub</h1>
          <nav className="header-nav">
            <span className="nav-placeholder