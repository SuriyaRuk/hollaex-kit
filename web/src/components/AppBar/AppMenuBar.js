import React, { Component } from 'react';
import { connect } from 'react-redux';

import withConfig from 'components/ConfigProvider/withConfig';
import AppMenuBarItem from './AppMenuBarItem';
import { EditWrapper, Connector } from 'components';
import { Editor, Frame, Element } from '@craftjs/core';
import { uniqueId } from 'lodash';
class AppMenuBar extends Component {
	render() {
		const { menuItems, activePath, onMenuChange } = this.props;

		return (
			<Element id={uniqueId()} is={Connector} canvas>
			<div className="app-menu-bar-wrapper d-flex justify-content-start">
				<div className="app-menu-bar d-flex align-items-start justify-content-start title-font apply_rtl">
					{menuItems.map(
						({ path, string_id, activePaths, hide_from_appbar }, index) => {
							return (
								!hide_from_appbar && (
										<AppMenuBarItem
											key={`appbar_item_${index}`}
											path={path}
											stringId={string_id}
											isActive={
												activePaths
													? activePaths.includes(activePath)
													: path === activePath
											}
											onClick={() => onMenuChange(path)}
										/>
									
								)
							);
						}
					)}
				</div>
			</div>

			</Element>
		
		);
	}
}

const mapStateToProps = ({ app: { language: activeLanguage } }) => {
	return {
		activeLanguage,
	};
};

export default connect(mapStateToProps)(withConfig(AppMenuBar));
