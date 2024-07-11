// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';

// Utilidades
import { mapAuthorForStory, mapResources, mapStoryContent } from '../_utils/functions';

// Modelos
import { Story, StoryBase } from '@models/story.model';
import { mapMediaSources } from '../_utils/media-sources.functions';

// Subqueries
import { storiesByAuthorSlugQuery, storyBySlugQuery } from '../_queries/story.query';

// Interfaces
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';
import { StoriesByAuthorSlugQueryResult } from '../sanity/types';

export async function fetchByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryBase[]> {
	const result: StoriesByAuthorSlugQueryResult = await client.fetch(storiesByAuthorSlugQuery, {
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});
	const stories = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const story of result) {
		const { body, mediaSources, resources, ...properties } = story;

		stories.push({
			...properties,
			media: await mapMediaSources(mediaSources),
			resources: mapResources(resources),
			paragraphs: body,
		});
	}

	return stories;
}

export async function fetchStoryBySlug(slug: string): Promise<Story> {
	const story = await client.fetch(storyBySlugQuery, { slug });

	const { body, review, author, mediaSources, ...properties } = story;

	return mapStoryContent({
		...properties,
		media: await mapMediaSources(mediaSources),
		author: mapAuthorForStory(author, properties.language),
		resources: mapResources(properties.resources),
		paragraphs: body,
		summary: review,
	});
}
