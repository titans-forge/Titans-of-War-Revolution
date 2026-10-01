import { Component } from 'react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Titans of War: Revolution failed to render.', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="error-screen">
        <p className="eyebrow">Campaign interrupted</p>
        <h1>The campaign could not be displayed.</h1>
        <p>Your local save remains intact. Reload the page first; reset the campaign only if the problem continues.</p>
        <button onClick={() => window.location.reload()}>Reload campaign</button>
      </main>
    );
  }
}
