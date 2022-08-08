import { createContext } from 'react';
import ARTICLE_DATA from '../AppData/articles';
import PROJECTS_DATA from '../AppData/projects';

const AppContext = createContext();
export const ArticleContext = createContext(ARTICLE_DATA);
export const ProjectsContext = createContext(PROJECTS_DATA);

export default AppContext;
