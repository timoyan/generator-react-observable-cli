const appEnv = process.env.REACT_APP_ENV;

export interface IConfig {
    appEnv: string;
}

const defaultConfig: IConfig = {
    appEnv
};

let config: IConfig;

if (appEnv === 'production') {
    config = {
        ...defaultConfig
    };
} else if (appEnv === 'preprod') {
    config = {
        ...defaultConfig
    };
} else if (appEnv === 'test') {
    config = {
        ...defaultConfig
    };
} else if (appEnv === 'development') {
    config = {
        ...defaultConfig
    };
}

export const Config: IConfig = {
    ...config
};
