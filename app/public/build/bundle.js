
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    const file$7 = "src/Button.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(button, "class", "svelte-11gdmub");
    			add_location(button, file$7, 12, 0, 126);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { handleClick: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
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

    // assets
    const imgPath = "../assets/image/";

    // ui
    const orange = "#D0B17E";
    const pink = "#DF84A7";

    // game 
    const gameTickTime = 1000;
    const gameTimeUnit = 100;
    const gameEndTime = 10000;
    const gameBackgroundImgPath = imgPath + "background.jpg";

    // level
    const fittingMinDiameter = 50;
    const fittingPadding = 15;
    const fittingAttempts = 800;
    const fittingDiameterRange = {low: 200, high: 350};
    const levelBounds = {x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8};

    // mole
    const moleAmount = 125;
    const moleInactiveImgPath = imgPath + "mole_inactive.png";
    const moleActiveImgRange = ["4.png", "3.png", "2.png", "1.png"];
    const moleValueRange = [100, 25, 15, 5];
    const moleActivationChanceRange = [0.07, 0.15, 0.25, 0.37];

    const width = writable(window.innerWidth);
    const height = writable(window.innerHeight);

    const gameState = writable("gameStart"); // gameStart, game, gameEnd
    const gameTime = writable(0);
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
    const file$6 = "src/GameStart.svelte";

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
    			add_location(nav, file$6, 28, 1, 394);
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

    function create_fragment$6(ctx) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameStart",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/ProgressBar.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/ProgressBar.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "progressBar svelte-6zlrub");
    			set_style(div0, "width", /*$progressTweened*/ ctx[0] + "%");
    			set_style(div0, "--pink", pink);
    			set_style(div0, "--orange", orange);
    			add_location(div0, file$5, 31, 1, 597);
    			attr_dev(div1, "class", "progressContainer svelte-6zlrub");
    			add_location(div1, file$5, 30, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progressTweened*/ 1) {
    				set_style(div0, "width", /*$progressTweened*/ ctx[0] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let progress;
    	let $gameTime;
    	let $progressTweened;
    	validate_store(gameTime, "gameTime");
    	component_subscribe($$self, gameTime, $$value => $$invalidate(3, $gameTime = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressBar", slots, []);
    	const progressTweened = tweened(0);
    	validate_store(progressTweened, "progressTweened");
    	component_subscribe($$self, progressTweened, value => $$invalidate(0, $progressTweened = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		tweened,
    		gameEndTime,
    		pink,
    		orange,
    		width,
    		gameTime,
    		progressTweened,
    		progress,
    		$gameTime,
    		$progressTweened
    	});

    	$$self.$inject_state = $$props => {
    		if ("progress" in $$props) $$invalidate(2, progress = $$props.progress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameTime*/ 8) {
    			$$invalidate(2, progress = Math.floor(100 / gameEndTime * $gameTime));
    		}

    		if ($$self.$$.dirty & /*progress*/ 4) {
    			progressTweened.set(progress);
    		}
    	};

    	return [$progressTweened, progressTweened, progress, $gameTime];
    }

    class ProgressBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressBar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/LiveScore.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/LiveScore.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t = text(/*$gameScore*/ ctx[0]);
    			attr_dev(h2, "class", "liveScore svelte-ix0ynb");
    			add_location(h2, file$4, 29, 1, 457);
    			attr_dev(div, "class", "scoreContainer svelte-ix0ynb");
    			add_location(div, file$4, 28, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$gameScore*/ 1) set_data_dev(t, /*$gameScore*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	let $gameScore;
    	validate_store(gameScore, "gameScore");
    	component_subscribe($$self, gameScore, $$value => $$invalidate(0, $gameScore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LiveScore", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LiveScore> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ gameScore, $gameScore });
    	return [$gameScore];
    }

    class LiveScore extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LiveScore",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Mole.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/Mole.svelte";

    function create_fragment$3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_style(span, "--size", /*diameter*/ ctx[2] + "px");
    			set_style(span, "--x", /*x*/ ctx[0] + "px");
    			set_style(span, "--y", /*y*/ ctx[1] + "px");
    			set_style(span, "--activePath", "url(" + imgPath + "mole_active_" + /*activeImgSrc*/ ctx[3] + ")");
    			set_style(span, "--inactivePath", "url(" + moleInactiveImgPath + ")");
    			attr_dev(span, "class", "svelte-90dh7e");
    			toggle_class(span, "inactive", !/*isActive*/ ctx[4]);
    			toggle_class(span, "active", /*isActive*/ ctx[4]);
    			add_location(span, file$3, 83, 0, 1569);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*handleClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*diameter*/ 4) {
    				set_style(span, "--size", /*diameter*/ ctx[2] + "px");
    			}

    			if (dirty & /*x*/ 1) {
    				set_style(span, "--x", /*x*/ ctx[0] + "px");
    			}

    			if (dirty & /*y*/ 2) {
    				set_style(span, "--y", /*y*/ ctx[1] + "px");
    			}

    			if (dirty & /*activeImgSrc*/ 8) {
    				set_style(span, "--activePath", "url(" + imgPath + "mole_active_" + /*activeImgSrc*/ ctx[3] + ")");
    			}

    			if (dirty & /*isActive*/ 16) {
    				toggle_class(span, "inactive", !/*isActive*/ ctx[4]);
    			}

    			if (dirty & /*isActive*/ 16) {
    				toggle_class(span, "active", /*isActive*/ ctx[4]);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $gameTime;
    	validate_store(gameTime, "gameTime");
    	component_subscribe($$self, gameTime, $$value => $$invalidate(8, $gameTime = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mole", slots, []);

    	let { x } = $$props,
    		{ y } = $$props,
    		{ diameter } = $$props,
    		{ value } = $$props,
    		{ activeImgSrc } = $$props,
    		{ activationChance } = $$props;

    	let isActive = false;

    	function handleTime() {
    		let isTick = $gameTime % gameTickTime == 0 ? true : false;

    		if (isTick) {
    			// reset mole on tick
    			$$invalidate(4, isActive = false);

    			// activate mole on chance
    			if (coinToss()) {
    				$$invalidate(4, isActive = true);
    			}
    		}
    	}

    	function handleClick() {
    		if (isActive) {
    			$$invalidate(4, isActive = false);
    			updateScore();
    		}
    	}

    	function updateScore() {
    		let v = parseInt(value);
    		gameScore.update(score => score + v);
    	}

    	function coinToss(chance) {
    		return Math.random() < activationChance ? true : false;
    	}

    	const writable_props = ["x", "y", "diameter", "value", "activeImgSrc", "activationChance"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mole> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("diameter" in $$props) $$invalidate(2, diameter = $$props.diameter);
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("activeImgSrc" in $$props) $$invalidate(3, activeImgSrc = $$props.activeImgSrc);
    		if ("activationChance" in $$props) $$invalidate(7, activationChance = $$props.activationChance);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		imgPath,
    		gameTickTime,
    		moleInactiveImgPath,
    		gameTime,
    		gameScore,
    		x,
    		y,
    		diameter,
    		value,
    		activeImgSrc,
    		activationChance,
    		isActive,
    		handleTime,
    		handleClick,
    		updateScore,
    		coinToss,
    		$gameTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("diameter" in $$props) $$invalidate(2, diameter = $$props.diameter);
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("activeImgSrc" in $$props) $$invalidate(3, activeImgSrc = $$props.activeImgSrc);
    		if ("activationChance" in $$props) $$invalidate(7, activationChance = $$props.activationChance);
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameTime*/ 256) {
    			(handleTime());
    		}
    	};

    	return [
    		x,
    		y,
    		diameter,
    		activeImgSrc,
    		isActive,
    		handleClick,
    		value,
    		activationChance,
    		$gameTime
    	];
    }

    class Mole extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			x: 0,
    			y: 1,
    			diameter: 2,
    			value: 6,
    			activeImgSrc: 3,
    			activationChance: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mole",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !("x" in props)) {
    			console.warn("<Mole> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !("y" in props)) {
    			console.warn("<Mole> was created without expected prop 'y'");
    		}

    		if (/*diameter*/ ctx[2] === undefined && !("diameter" in props)) {
    			console.warn("<Mole> was created without expected prop 'diameter'");
    		}

    		if (/*value*/ ctx[6] === undefined && !("value" in props)) {
    			console.warn("<Mole> was created without expected prop 'value'");
    		}

    		if (/*activeImgSrc*/ ctx[3] === undefined && !("activeImgSrc" in props)) {
    			console.warn("<Mole> was created without expected prop 'activeImgSrc'");
    		}

    		if (/*activationChance*/ ctx[7] === undefined && !("activationChance" in props)) {
    			console.warn("<Mole> was created without expected prop 'activationChance'");
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

    	get diameter() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set diameter(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImgSrc() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImgSrc(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activationChance() {
    		throw new Error("<Mole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activationChance(value) {
    		throw new Error("<Mole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function roundToTwo(num) {    
        return +(Math.round(num + "e+2")  + "e-2");
    }

    function getRandomInRange(low, high) {
    	return Math.random() * (high - low) + low;
    }

    function rerange (value, inLow, inHigh, outLow, outHigh) {
        return (value - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
    }

    function matchItemWithinRange(value, inLow, inHigh, items) {
    	const step = (inHigh - inLow) / items.length;
    	for(let i = 0; i < items.length; i++) {
    		let limitLow = step * i + inLow;
    		let limitHigh = step * (i + 1) + inLow;
    		if(value >= limitLow && value <= limitHigh) {
    			return items[i]
    		}
    	}
    }

    function getAbsoluteBounds(relativeBounds, width, height) {
    	const {x1: rX1, y1: rY1, x2: rX2, y2: rY2} = relativeBounds;
    	return {x1: rX1 * width, 
    			y1: rY1 * height, 
    			x2: rX2 * width, 
    			y2: rY2 * height}		
    }

    function doCirclesOverlap (circle1, circle2) {
    	const {x: c1X, y: c1Y, diameter: c1D} = circle1;
    	const {x: c2X, y: c2Y, diameter: c2D} = circle2;
    	const dist = Math.hypot(c2X-c1X, c2Y-c1Y);
    	const c1R = c1D / 2;
    	const c2R = c2D / 2;
    	const rSum  = c1R + c2R;
    	const rSumPadded = rSum + fittingPadding;
        return (dist <= rSumPadded) ? true : false;
    }

    function getRandomCircle(bounds, diameter) {
    	const {x1, y1, x2, y2} = bounds;
    	const x = roundToTwo(getRandomInRange(x1, x2));
    	const y = roundToTwo(getRandomInRange(y1, y2));
    	return {x: x, y: y, diameter: diameter};
    }

    function fitRandomCircle(circles, bounds, diameter, attempts) {
    	for(let i = 0; i < attempts; i++) {
    		const newDiameter = roundToTwo(rerange(i, 0, attempts, diameter, fittingMinDiameter));
    		const newCircle = getRandomCircle(bounds, newDiameter);
    		const overlaps = circles.map( circle => doCirclesOverlap(circle, newCircle));
    		if(overlaps.every(v => v == false)) {
    			return newCircle;
    		}
    	}
    }

    function fitCircles(circlesAmount, bounds, diameterRange) {
    	const {low: diamLow, high: diamHigh} = diameterRange;
    	const firstCircle = getRandomCircle(bounds, diamHigh);	
    	let circles = [firstCircle];
    	for(let i = 0; i < circlesAmount; i++) {
    		const newDiameter = roundToTwo(getRandomInRange(diamLow, diamHigh));
    		const newCircle = fitRandomCircle(circles, bounds, newDiameter, fittingAttempts);
    		if(newCircle) {
    			circles.push(newCircle);
    		}
    	}
    	return circles;
    }


    function getMolesFromCircles(circles) {
    	circles.map((circle) => {
    		const diameter = circle.diameter;
    		const value = matchItemWithinRange(diameter,
    										   fittingMinDiameter,
    										   fittingDiameterRange.high,
    										   moleValueRange);
    		const activeImgSrc = matchItemWithinRange(diameter,
    										  		  fittingMinDiameter,
    										  		  fittingDiameterRange.high,
    										  		  moleActiveImgRange);
    		const activationChance = matchItemWithinRange(diameter,
    										   fittingMinDiameter,
    										   fittingDiameterRange.high,
    										   moleActivationChanceRange);		
    		let mole = circle;
    			mole.value = value;
    			mole.activeImgSrc = activeImgSrc;
    			mole.activationChance = activationChance;

    		return mole;
    	});
    }

    function generateMoles(width, height) {
    	const absBounds = getAbsoluteBounds(levelBounds, width, height);
    	const circles = fitCircles(moleAmount, absBounds, fittingDiameterRange);
    	getMolesFromCircles(circles);
    	return circles;
    }

    /* src/Game.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/Game.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (62:1) {#each moles as mole}
    function create_each_block(ctx) {
    	let mole;
    	let current;
    	const mole_spread_levels = [/*mole*/ ctx[9]];
    	let mole_props = {};

    	for (let i = 0; i < mole_spread_levels.length; i += 1) {
    		mole_props = assign(mole_props, mole_spread_levels[i]);
    	}

    	mole = new Mole({ props: mole_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mole.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mole, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mole_changes = (dirty & /*moles*/ 1)
    			? get_spread_update(mole_spread_levels, [get_spread_object(/*mole*/ ctx[9])])
    			: {};

    			mole.$set(mole_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mole.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mole.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mole, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:1) {#each moles as mole}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let livescore;
    	let t0;
    	let t1;
    	let progressbar;
    	let div_transition;
    	let current;
    	livescore = new LiveScore({ $$inline: true });
    	let each_value = /*moles*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	progressbar = new ProgressBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(livescore.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(progressbar.$$.fragment);
    			attr_dev(div, "class", "svelte-1h3srv6");
    			add_location(div, file$2, 59, 0, 1052);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(livescore, div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			mount_component(progressbar, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*moles*/ 1) {
    				each_value = /*moles*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(livescore.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(progressbar.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 500 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(livescore.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(progressbar.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 500 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(livescore);
    			destroy_each(each_blocks, detaching);
    			destroy_component(progressbar);
    			if (detaching && div_transition) div_transition.end();
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
    	let $width;
    	let $height;
    	let $gameTime;
    	validate_store(width, "width");
    	component_subscribe($$self, width, $$value => $$invalidate(2, $width = $$value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, $$value => $$invalidate(3, $height = $$value));
    	validate_store(gameTime, "gameTime");
    	component_subscribe($$self, gameTime, $$value => $$invalidate(4, $gameTime = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);
    	const moles = generateMoles($width, $height);
    	let gameLoopInterval;

    	onMount(() => {
    		setTimeout(
    			() => {
    				startGameLoop();
    			},
    			1500
    		);
    	});

    	onDestroy(() => {
    		resetTime();
    	});

    	function startGameLoop() {
    		gameLoopInterval = setInterval(
    			() => {
    				handleTime();
    				updateTime();
    			},
    			gameTimeUnit
    		);
    	}

    	function handleTime() {
    		if ($gameTime >= gameEndTime) {
    			clearInterval(gameLoopInterval);
    			gameState.set("gameEnd");
    		}
    	}

    	function updateTime() {
    		gameTime.update(t => t + gameTimeUnit);
    	}

    	function resetTime() {
    		gameTime.set(0);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		fade,
    		ProgressBar,
    		LiveScore,
    		Mole,
    		gameTimeUnit,
    		gameTickTime,
    		gameEndTime,
    		generateMoles,
    		gameState,
    		gameTime,
    		width,
    		height,
    		moles,
    		gameLoopInterval,
    		startGameLoop,
    		handleTime,
    		updateTime,
    		resetTime,
    		$width,
    		$height,
    		$gameTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("gameLoopInterval" in $$props) gameLoopInterval = $$props.gameLoopInterval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [moles];
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
    	let nav;
    	let button0;
    	let t3;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				handleClick: /*playAgain*/ ctx[1],
    				text: "play again"
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				handleClick: /*returnToStart*/ ctx[2],
    				text: "return to menu"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("game over, your score is ");
    			t1 = text(/*$gameScore*/ ctx[0]);
    			t2 = space();
    			nav = element("nav");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h1, "class", "svelte-1f8z4rw");
    			add_location(h1, file$1, 23, 0, 301);
    			add_location(nav, file$1, 24, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, nav, anchor);
    			mount_component(button0, nav, null);
    			append_dev(nav, t3);
    			mount_component(button1, nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$gameScore*/ 1) set_data_dev(t1, /*$gameScore*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(nav);
    			destroy_component(button0);
    			destroy_component(button1);
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
    		gameScore.set(0);
    	}

    	function returnToStart() {
    		gameState.set("gameStart");
    		gameScore.set(0);
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
    		returnToStart,
    		$gameScore
    	});

    	return [$gameScore, playAgain, returnToStart];
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
    const file = "src/App.svelte";

    // (35:1) {:else}
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
    		source: "(35:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:32) 
    function create_if_block_1(ctx) {
    	let game;
    	let current;
    	game = new Game({ $$inline: true });

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
    		source: "(33:32) ",
    		ctx
    	});

    	return block;
    }

    // (31:2) {#if $gameState == "gameStart"}
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
    		source: "(31:2) {#if $gameState == \\\"gameStart\\\"}",
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
    			set_style(section, "width", /*$width*/ ctx[0] + "px");
    			set_style(section, "height", /*$height*/ ctx[1] + "px");
    			set_style(section, "--bgPath", "url(" + gameBackgroundImgPath + ")");
    			attr_dev(section, "class", "svelte-lynf7d");
    			add_location(section, file, 29, 0, 512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[3]);
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

    			if (!current || dirty & /*$width*/ 1) {
    				set_style(section, "width", /*$width*/ ctx[0] + "px");
    			}

    			if (!current || dirty & /*$height*/ 2) {
    				set_style(section, "height", /*$height*/ ctx[1] + "px");
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
    	let $width;
    	let $height;
    	let $gameState;
    	validate_store(width, "width");
    	component_subscribe($$self, width, $$value => $$invalidate(0, $width = $$value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, $$value => $$invalidate(1, $height = $$value));
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(2, $gameState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		width.set($width = window.innerWidth);
    		height.set($height = window.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		GameStart,
    		Game,
    		GameEnd,
    		gameBackgroundImgPath,
    		width,
    		height,
    		gameState,
    		$width,
    		$height,
    		$gameState
    	});

    	return [$width, $height, $gameState, onwindowresize];
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
