import {m} from 'malevic';
import {getContext} from 'malevic/dom';
import {Button, MessageBox, Overlay} from '../../controls';
import {getURLHostOrProtocol, isURLInList} from '../../../utils/url';
import type {ExtWrapper} from '../../../definitions';
import {getLocalMessage} from '../../../utils/locales';

export default function Body({data, actions}: ExtWrapper) {
    const context = getContext();
    const host = getURLHostOrProtocol(data.activeTab.url);
    const custom = data.settings.customThemes.find(({url}) => isURLInList(data.activeTab.url, url));

    let textNode: HTMLTextAreaElement;

    const placeholderText = [
        '* {',
        '    background-color: #234 !important;',
        '    color: #cba !important;',
        '}',
    ].join('\n');

    function onTextRender(node: HTMLTextAreaElement) {
        textNode = node;
        textNode.value = (custom ? custom.theme.stylesheet : data.settings.theme.stylesheet) || '';
        if (document.activeElement !== textNode) {
            textNode.focus();
        }
    }

    function applyStyleSheet(css: string) {
        if (custom) {
            custom.theme = {...custom.theme, ...{stylesheet: css}};
            actions.changeSettings({customThemes: data.settings.customThemes});
        } else {
            actions.setTheme({stylesheet: css});
        }
    }

    function showDialog() {
        context.store.isDialogVisible = true;
        context.refresh();
    }

    function hideDialog() {
        context.store.isDialogVisible = false;
        context.refresh();
    }

    const dialog = context && context.store.isDialogVisible ? (
        <MessageBox
            caption={getLocalMessage('ask_remove_changes')}
            onOK={reset}
            onCancel={hideDialog}
        />
    ) : null;

    function reset() {
        context.store.isDialogVisible = false;
        applyStyleSheet('');
    }

    function apply() {
        const css = textNode.value;
        applyStyleSheet(css);
    }

    return (
        <body>
            <header>
                <img id="logo" src="../assets/images/darkreader-type.svg" alt="Dark Reader" />
                <h1 id="title">{getLocalMessage('css_editor')}</h1>
            </header>
            <h3 class="sub-title">{custom ? host : getLocalMessage('all_websites')}</h3>
            <textarea
                class="editor"
                native
                placeholder={placeholderText}
                onrender={onTextRender}
                spellcheck="false"
                autocorrect="off"
                autocomplete="off"
                autocapitalize="off"
            />
            <div class="buttons">
                <Button onclick={showDialog}>
                    {getLocalMessage('reset_changes')}
                    {dialog}
                </Button>
                <Button onclick={apply}>
                    {getLocalMessage('apply')}
                </Button>
            </div>
            <Overlay />
        </body>
    );
}
