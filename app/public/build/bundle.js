
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Button.svelte generated by Svelte v3.38.2 */

    const file$4 = "src/Button.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(button, "class", "svelte-11gdmub");
    			add_location(button, file$4, 12, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[0])) /*handleClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { handleClick } = $$props;
    	let { text } = $$props;
    	const writable_props = ["handleClick", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("handleClick" in $$props) $$invalidate(0, handleClick = $$props.handleClick);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ handleClick, text });

    	$$self.$inject_state = $$props => {
    		if ("handleClick" in $$props) $$invalidate(0, handleClick = $$props.handleClick);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleClick, text];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { handleClick: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleClick*/ ctx[0] === undefined && !("handleClick" in props)) {
    			console.warn("<Button> was created without expected prop 'handleClick'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<Button> was created without expected prop 'text'");
    		}
    	}

    	get handleClick() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // game 
    // export const tickSpeed = 100;
    const gameTickTime = 3000;
    const gameEndTime = 5000;

    // mole
    const moleWidth = 25;
    const moleActivationChance = 0.5;

    const gameState = writable("gameStart"); // gameStart, game, gameEnd
    const gameTicker = writable(0);
    const gameScore = writable(0);
    // export const gameTicker = readable(0, function start(set) {
    // 	const interval = setInterval((v) => {
    // 		set(get(gameTicker) + gameTickTime);
    // 	}, gameTickTime);
    // 	return function stop() {
    // 		clearInterval(interval);
    // 	};
    // });

    /* src/GameStart.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/GameStart.svelte";

    // (28:0) {#if $gameState == "gameStart"}
    function create_if_block$1(ctx) {
    	let nav;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				handleClick: /*startGame*/ ctx[1],
    				text: "start game"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(button.$$.fragment);
    			attr_dev(nav, "class", "svelte-nyfbc7");
    			add_location(nav, file$3, 28, 1, 394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(button, nav, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:0) {#if $gameState == \\\"gameStart\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$gameState*/ ctx[0] == "gameStart" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$gameState*/ ctx[0] == "gameStart") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$gameState*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $gameState;
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(0, $gameState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameStart", slots, []);

    	function startGame() {
    		gameState.set("game");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameStart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button, gameState, startGame, $gameState });
    	return [$gameState, startGame];
    }

    class GameStart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameStart",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Mole.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/Mole.svelte";

    function create_fragment$3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_style(span, "--size", moleWidth + "px");
    			set_style(span, "--x", /*x*/ ctx[0] + "px");
    			set_style(span, "--y", /*y*/ ctx[1] + "px");
    			attr_dev(span, "class", "svelte-6ul844");
    			toggle_class(span, "active", /*isActive*/ ctx[2]);
    			add_location(span, file$2, 60, 0, 970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*handleClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*x*/ 1) {
    				set_style(span, "--x", /*x*/ ctx[0] + "px");
    			}

    			if (dirty & /*y*/ 2) {
    				set_style(span, "--y", /*y*/ ctx[1] + "px");
    			}

    			if (dirty & /*isActive*/ 4) {
    				toggle_class(span, "active", /*isActive*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function coinToss(chance) {
    	return Math.random() < chance ? true : false;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $gameTicker;
    	validate_store(gameTicker, "gameTicker");
    	component_subscribe($$self, gameTicker, $$value => $$invalidate(5, $gameTicker = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mole", slots, []);
    	let { x } = $$props, { y } = $$props, { value } = $$props;
    	let isActive = false;

    	onMount(() => {
    		console.log(value);
    	});

    	function handleTicks() {
    		// reset mole on tick
    		$$invalidate(2, isActive = false);

    		// activate mole on chance
    		if (coinToss(moleActivationChance)) {
    			$$invalidate(2, isActive = true);
    		}
    	}

    	function handleClick() {
    		if (isActive) {
    			$$invalidate(2, isActive = false);
    			updateScore();
    		}
    	}

    	function updateScore() {
    		let v = parseInt(value);
    		gameScore.update(score => score + v);
    	}

    	const writable_props = ["x", "y", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Mole> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		moleWidth,
    		moleActivationChance,
    		gameTicker,
    		gameScore,
    		x,
    		y,
    		value,
    		isActive,
    		handleTicks,
    		handleClick,
    		updateScore,
    		coinToss,
    		$gameTicker
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("isActive" in $$props) $$invalidate(2, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameTicker*/ 32) {
    			(handleTicks());
    		}
    	};

    	return [x, y, isActive, handleClick, value, $gameTicker];
    }

    class Mole extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { x: 0, y: 1, value: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mole",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !("x" in props)) {
    			console_1$1.warn("<Mole> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !("y" in props)) {
    			console_1$1.warn("<Mole> was created without expected prop 'y'");
    		}

    		if (/*value*/ ctx[4] === undefined && !("value" in props)) {
    			console_1$1.warn("<Mole> was created without expected prop 'value'");
    		}
    	}

    	get x() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Game.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;

    function create_fragment$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $gameTicker;
    	validate_store(gameTicker, "gameTicker");
    	component_subscribe($$self, gameTicker, $$value => $$invalidate(3, $gameTicker = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, ['default']);
    	let gameLoopInterval;

    	onMount(() => {
    		startGameLoop();
    	});

    	onDestroy(() => {
    		resetTicker();
    		clearInterval(gameLoopInterval);
    	});

    	function startGameLoop() {
    		gameLoopInterval = setInterval(
    			() => {
    				handleTicks();
    				updateTicker();
    			},
    			gameTickTime
    		);
    	}

    	function updateTicker() {
    		gameTicker.update(t => t + gameTickTime);
    	}

    	function resetTicker() {
    		gameTicker.set(0);
    	}

    	function handleTicks() {
    		console.log($gameTicker);

    		if ($gameTicker >= gameEndTime) {
    			gameState.set("gameEnd");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		Mole,
    		gameTickTime,
    		gameEndTime,
    		gameState,
    		gameTicker,
    		gameLoopInterval,
    		startGameLoop,
    		updateTicker,
    		resetTicker,
    		handleTicks,
    		$gameTicker
    	});

    	$$self.$inject_state = $$props => {
    		if ("gameLoopInterval" in $$props) gameLoopInterval = $$props.gameLoopInterval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$$scope, slots];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/GameEnd.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/GameEnd.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				handleClick: /*playAgain*/ ctx[1],
    				text: "play again"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("game over, your score is ");
    			t1 = text(/*$gameScore*/ ctx[0]);
    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(h1, "class", "svelte-1f8z4rw");
    			add_location(h1, file$1, 17, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$gameScore*/ 1) set_data_dev(t1, /*$gameScore*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $gameScore;
    	validate_store(gameScore, "gameScore");
    	component_subscribe($$self, gameScore, $$value => $$invalidate(0, $gameScore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameEnd", slots, []);

    	function playAgain() {
    		gameState.set("game");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameEnd> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		gameState,
    		gameScore,
    		Button,
    		playAgain,
    		$gameScore
    	});

    	return [$gameScore, playAgain];
    }

    class GameEnd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameEnd",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { window: window_1 } = globals;
    const file = "src/App.svelte";

    // (37:1) {:else}
    function create_else_block(ctx) {
    	let gameend;
    	let current;
    	gameend = new GameEnd({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gameend.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gameend, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameend.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameend.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gameend, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(37:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:32) 
    function create_if_block_1(ctx) {
    	let game;
    	let current;

    	game = new Game({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(30:32) ",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#if $gameState == "gameStart"}
    function create_if_block(ctx) {
    	let gamestart;
    	let current;
    	gamestart = new GameStart({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gamestart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamestart, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamestart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamestart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamestart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:1) {#if $gameState == \\\"gameStart\\\"}",
    		ctx
    	});

    	return block;
    }

    // (31:2) <Game>
    function create_default_slot(ctx) {
    	let mole0;
    	let t0;
    	let mole1;
    	let t1;
    	let mole2;
    	let t2;
    	let mole3;
    	let current;

    	mole0 = new Mole({
    			props: { x: "50", y: "50", value: "10" },
    			$$inline: true
    		});

    	mole1 = new Mole({
    			props: { x: "100", y: "100", value: "10" },
    			$$inline: true
    		});

    	mole2 = new Mole({
    			props: { x: "200", y: "200", value: "10" },
    			$$inline: true
    		});

    	mole3 = new Mole({
    			props: { x: "300", y: "300", value: "10" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mole0.$$.fragment);
    			t0 = space();
    			create_component(mole1.$$.fragment);
    			t1 = space();
    			create_component(mole2.$$.fragment);
    			t2 = space();
    			create_component(mole3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mole0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(mole1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(mole2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(mole3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mole0.$$.fragment, local);
    			transition_in(mole1.$$.fragment, local);
    			transition_in(mole2.$$.fragment, local);
    			transition_in(mole3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mole0.$$.fragment, local);
    			transition_out(mole1.$$.fragment, local);
    			transition_out(mole2.$$.fragment, local);
    			transition_out(mole3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mole0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(mole1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(mole2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(mole3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:2) <Game>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[3]);
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$gameState*/ ctx[2] == "gameStart") return 0;
    		if (/*$gameState*/ ctx[2] == "game") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			set_style(section, "width", /*width*/ ctx[0] + "px");
    			set_style(section, "height", /*height*/ ctx[1] + "px");
    			attr_dev(section, "class", "svelte-pv010x");
    			add_location(section, file, 26, 0, 438);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}

    			if (!current || dirty & /*width*/ 1) {
    				set_style(section, "width", /*width*/ ctx[0] + "px");
    			}

    			if (!current || dirty & /*height*/ 2) {
    				set_style(section, "height", /*height*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $gameState;
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(2, $gameState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let width = window.innerWidth;
    	let height = window.innerHeight;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, width = window_1.innerWidth);
    		$$invalidate(1, height = window_1.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		GameStart,
    		Game,
    		GameEnd,
    		Mole,
    		gameState,
    		width,
    		height,
    		$gameState
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, $gameState, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
