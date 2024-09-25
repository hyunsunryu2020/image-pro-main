import { ChangeEvent, memo, useEffect, useState } from 'react';
import styles from '@/components/sidePanel/sections/AIDraw/aiDraw.module.css';
import { TextArea, Tooltip, Tag } from '@blueprintjs/core';
import { InfoIcon } from '@/components/icons';
import { ModelState } from '@/common/types/AIServices.ts';

// const PROMPT_TOOLTIP: string = 'A "prompt" refers to a specific instruction or query given to the AI model to
// generate text or content. This prompt sets the direction for the AI\'s response. It can be a sentence or a few
// keywords that guide the AI in producing the desired output.'; const NEGATIVE_PROMPT_TOOLTIP: string = 'A "negative
// prompt" is an instruction that tells the AI what not to do or what kind of content to avoid in its response. It
// helps prevent the AI from generating undesirable or inappropriate content. For example, if you\'re using the AI to
// write a story and you want to avoid violence, a negative prompt could be "Avoid violent scenes."';

const PromptSection = memo(function PromptSection(props: {
		prompt?: ModelState,
		negative_prompt?: ModelState,
		onChange: Function
	}): JSX.Element {
		const [prompt, setPrompt] = useState<string>(props.prompt?.default as string || '');
		const [negativePrompt, setNegativePrompt] = useState<string>(props.negative_prompt?.default as string || '');
		useEffect(() => {
			props.prompt && setPrompt(props.prompt.default as string);
		}, [props.prompt]);

		function updateValue(role: string, e: ChangeEvent<HTMLTextAreaElement>): void {
			let tmpValue: {
				prompt: string,
				negative_prompt: string
			};
			if (role === 'POSITIVE') {
				tmpValue = {
					prompt: e.target.value,
					negative_prompt: negativePrompt,
				};
				setPrompt(e.target.value);
			} else {
				tmpValue = {
					prompt: prompt,
					negative_prompt: e.target.value,
				};
				setNegativePrompt(e.target.value);
			}

			props.onChange(tmpValue);
		}

		function handlePromptTag(role: string, tag: string): void {
			let tmpValue: {
				prompt: string,
				negative_prompt: string
			};
			if (role === 'POSITIVE') {
				// const tmpPrompt = prompt.length > 0 && prompt.at(-1) === ',' ? `${prompt} ${tag}` : `${prompt},
				// ${tag}`;
				tmpValue = {
					prompt: tag,
					negative_prompt: negativePrompt,
				};
				setPrompt(tag);
			} else {
				// const tmpPrompt = negativePrompt.length > 0 && negativePrompt.at(-1) === ','
				// 				  ? `${negativePrompt} ${tag}`
				// 				  : `${negativePrompt}, ${tag}`;
				tmpValue = {
					prompt: prompt,
					negative_prompt: tag,
				};
				setNegativePrompt(tag);
			}
			props.onChange(tmpValue);
		}


		return (
			<>
				<div className={`${styles.promptLabel} ${styles.subTitle}`}>
					<p>Positive prompts</p>
					<Tooltip content={<p className={styles.toolTipWrapper}>{props.prompt.toolTip}</p>}>
						{InfoIcon}
					</Tooltip>
				</div>
				<TextArea
					className={styles.promptInput}
					fill
					autoResize
					placeholder="please input positive prompts"
					value={prompt}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateValue('POSITIVE', e)}
				/>
				<p className={styles.subTitle}>Examples</p>

				{props.prompt.tags.map((tag: string) =>
					<Tag className={styles.promptTags} key={tag}
						 interactive multiline
						 onClick={() => handlePromptTag('POSITIVE', tag)}>
						{tag}
					</Tag>)
				}

				<div className={`${styles.promptLabel} ${styles.subTitle}`}>
					<p>Negative prompts</p>
					<Tooltip content={<p className={styles.toolTipWrapper}>{props.negative_prompt.toolTip}</p>}>
						{InfoIcon}
					</Tooltip>
				</div>
				<TextArea
					className={styles.promptInput}
					fill
					autoResize
					placeholder="please input negative prompts"
					value={negativePrompt}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateValue('NEGATIVE', e)}
				/>
				<p className={styles.subTitle}>Examples</p>

				{props.negative_prompt.tags.map((tag: string) =>
					<Tag className={styles.promptTags} key={tag}
						 interactive multiline
						 onClick={() => handlePromptTag('NEGATIVE', tag)}>
						{tag}
					</Tag>)
				}
			</>
		);
	},
);

export default PromptSection;