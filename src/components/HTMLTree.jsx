/**
 * # Component: HTMLTree
 *
 * Public interface of the component
 */

import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { parseDOM } from 'htmlparser2'

import getStyles from '../themes/'
import Container from './Container'

const isBrowser = typeof HTMLElement !== 'undefined'

/**
 *
 */
export default class HTMLTree extends Component {

  static defaultProps = {
    theme: 'chrome-devtools',
    defaultExpanded: true,
    showExpander: false,
    defaultExpandedTags: ['html', 'body']
  };

  static propTypes = {
    source: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
      PropTypes.instanceOf(isBrowser ? HTMLElement : Object),
    ]).isRequired,
    theme: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired,
    defaultExpanded: PropTypes.bool.isRequired,
    defaultExpandedTags: PropTypes.array.isRequired,
    showExpander: PropTypes.bool.isRequired,
    customRender: PropTypes.func,
    onHover: PropTypes.func,
    onExpand: PropTypes.func,
    onSelect: PropTypes.func,
    onUnfocus: PropTypes.func
  };

  componentDidMount(){
    const { source } = this.props
    // keep state of provided source and representation view in sync
    if (isBrowser && source instanceof HTMLElement) {
      const element = findDOMNode(this)
      this.observer = new MutationObserver((mutations) => {
        const inception = mutations.some((mutation) => element.contains(mutation.target))
        if (!inception) {
          this.forceUpdate()
        }
      }).observe(source, {
        childList: true,
        subtree: true,
        attributes: true
      })
    }
  }

  componentWillUnmount(){
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  render(){
    const { source, theme, ...defaultsAndEventHandlers } = this.props

    const origin = isBrowser && source instanceof HTMLElement && source
    const tree = parseDOM(/** sourceText **/
      origin ? source.outerHTML :
      (React.isValidElement(source) ? renderToString(source) : source.replace(/<!DOCTYPE(.|\n|\r)*?>/i, ''))
    )

    const componentStyles = getStyles(theme)

    return (
      <div className="HTMLTree">
        <style dangerouslySetInnerHTML={{ __html: componentStyles }}/>
        <Container tree={tree} origin={origin||null} {...defaultsAndEventHandlers}/>
      </div>
    )
  }

}
